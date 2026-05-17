const Docker = require('dockerode')
const simpleGit = require('simple-git')
const fs = require('fs')
const path = require('path')
const { execSync, exec } = require('child_process')
const { REPOS_DIR } = require('../config/env')

// ── Conexión a Docker ──────────────────────────────────────
function createDocker() {
  if (process.env.DOCKER_HOST) {
    const url = new URL(process.env.DOCKER_HOST)
    console.log(`[Docker] Conectando via DOCKER_HOST → ${url.hostname}:${url.port}`)
    return new Docker({ host: url.hostname, port: parseInt(url.port) })
  }
  if (process.platform === 'win32') {
    console.log('[Docker] Windows detectado — usando TCP localhost:2375')
    return new Docker({ host: 'localhost', port: 2375 })
  }
  console.log('[Docker] Unix socket /var/run/docker.sock')
  return new Docker({ socketPath: '/var/run/docker.sock' })
}

const docker = createDocker()

// ── Clonar o actualizar repo ───────────────────────────────
async function cloneRepo(repoUrl, projectId) {
  const repoDir = path.join(REPOS_DIR, projectId)
  console.log(`[cloneRepo] REPOS_DIR = ${REPOS_DIR}`)
  console.log(`[cloneRepo] repoDir   = ${repoDir}`)

  if (fs.existsSync(repoDir)) {
    console.log(`[cloneRepo] Directorio existe — ejecutando git pull...`)
    await simpleGit(repoDir).pull()
    console.log(`[cloneRepo] Pull completado`)
  } else {
    console.log(`[cloneRepo] Clonando ${repoUrl} → ${repoDir}`)
    fs.mkdirSync(repoDir, { recursive: true })
    await simpleGit().clone(repoUrl, repoDir)
    console.log(`[cloneRepo] Clon completado`)
  }

  return repoDir
}

// ── Detectar tipo de despliegue ───────────────────────────
function detectDeployType(repoDir) {
  const hasCompose = fs.existsSync(path.join(repoDir, 'docker-compose.yml')) ||
    fs.existsSync(path.join(repoDir, 'docker-compose.yaml'))
  const hasDockerfile = fs.existsSync(path.join(repoDir, 'Dockerfile'))
  console.log(`[detectDeployType] compose=${hasCompose} dockerfile=${hasDockerfile}`)
  if (hasCompose) return 'compose'
  if (hasDockerfile) return 'dockerfile'
  return null
}

// ── Build imagen (solo Dockerfile) ───────────────────────
async function buildImage(repoDir, imageTag) {
  console.log(`[buildImage] Construyendo imagen: ${imageTag}`)
  const entries = fs.readdirSync(repoDir)
  console.log(`[buildImage] Archivos en contexto: ${entries.join(', ')}`)

  const buildStream = await docker.buildImage(
    { context: repoDir, src: entries },
    { t: imageTag, nocache: false }
  )

  return new Promise((resolve, reject) => {
    let lastError = null

    buildStream.on('data', (chunk) => {
      try {
        const lines = chunk.toString().split('\n').filter(Boolean)
        for (const line of lines) {
          const event = JSON.parse(line)
          if (event.stream) process.stdout.write(`  [build] ${event.stream}`)
          if (event.error) {
            console.error(`  [build ERROR] ${event.error}`)
            lastError = event.error
          }
          if (event.status) console.log(`  [build] ${event.status}`)
        }
      } catch { }
    })

    buildStream.on('end', () => {
      if (lastError) {
        reject(new Error(lastError.trim()))
      } else {
        console.log(`[buildImage] ✓ Build finalizado: ${imageTag}`)
        resolve(imageTag)
      }
    })

    buildStream.on('error', (err) => {
      console.error(`[buildImage] Stream error: ${err.message}`)
      reject(err)
    })
  })
}

// ── Correr contenedor (solo Dockerfile) ──────────────────
async function runContainer(imageTag, containerName, hostPort, appPort = 3000) {
  console.log(`[runContainer] ${imageTag} → localhost:${hostPort}`)

  const container = await docker.createContainer({
    Image: imageTag,
    name: containerName,
    ExposedPorts: { [`${appPort}/tcp`]: {} },
    HostConfig: {
      PortBindings: { [`${appPort}/tcp`]: [{ HostPort: String(hostPort) }] },
      AutoRemove: false,
      Memory: 512 * 1024 * 1024,
      NanoCpus: 1 * 1e9,
      MemorySwap: 512 * 1024 * 1024,
    },
  })

  await container.start()
  const info = await container.inspect()
  console.log(`[runContainer] ✓ Corriendo id=${info.Id.slice(0, 12)}`)
  return { containerId: info.Id, imageId: info.Image }
}

// ── Deploy con docker-compose ─────────────────────────────
async function runCompose(repoDir, projectName, hostPort) {
  console.log(`[runCompose] Levantando compose en ${repoDir} proyecto=${projectName}`)

  // Leer el docker-compose.yml y reemplazar puertos hardcodeados
  const composePath = fs.existsSync(path.join(repoDir, 'docker-compose.yml'))
    ? path.join(repoDir, 'docker-compose.yml')
    : path.join(repoDir, 'docker-compose.yaml')

  let composeContent = fs.readFileSync(composePath, 'utf8')

  // Reemplazar puertos — asignar uno diferente a cada servicio
  let portCounter = hostPort
  composeContent = composeContent.replace(
    /- ["']?(\d+):(\d+)["']?/g,
    (match, host, container) => {
      const assigned = portCounter
      portCounter++
      return `- "${assigned}:${container}"`
    }
  )

  // Reemplazar cualquier puerto expuesto con el puerto asignado
  // Patrón: "XXXX:YYYY" → "hostPort:YYYY"
  composeContent = composeContent.replace(
    /- ["']?(\d+):(\d+)["']?/g,
    (match, host, container) => `- "${hostPort}:${container}"`
  )

  // Quitar la red custom para evitar conflictos
  composeContent = composeContent.replace(
    /networks:[\s\S]*?(?=\nservices:|\nvolumes:|$)/g, ''
  )
  composeContent = composeContent.replace(/networks:[\s\S]*$/g, '')

  fs.writeFileSync(composePath, composeContent, 'utf8')
  console.log(`[runCompose] docker-compose.yml modificado — puerto: ${hostPort}`)

  return new Promise((resolve, reject) => {
    const cmd = `docker-compose -p ${projectName} up --build -d`
    console.log(`[runCompose] Ejecutando: ${cmd}`)

    exec(cmd, { cwd: repoDir, timeout: 300000 }, async (err, stdout, stderr) => {
      if (err) {
        console.error(`[runCompose] Error: ${err.message}`)
        return reject(new Error(stderr || err.message))
      }
      console.log(`[runCompose] ✓ Compose levantado`)

      try {
        const output = execSync(
          `docker-compose -p ${projectName} ps -q`,
          { cwd: repoDir }
        ).toString().trim()
        const containerIds = output.split('\n').filter(Boolean)
        resolve({ containerId: containerIds[0] || projectName, imageId: projectName, containerIds })
      } catch {
        resolve({ containerId: projectName, imageId: projectName, containerIds: [] })
      }
    })
  })
}

// ── Detener contenedor ────────────────────────────────────
async function stopContainer(containerId) {
  try {
    const container = docker.getContainer(containerId)
    await container.stop()
    console.log(`[stopContainer] ✓ Detenido ${containerId.slice(0, 12)}`)
  } catch (err) {
    if (!err.message.includes('not running')) throw err
  }
}

// ── Detener compose ───────────────────────────────────────
async function stopCompose(repoDir, projectName) {
  return new Promise((resolve, reject) => {
    exec(
      `docker-compose -p ${projectName} stop`,
      { cwd: repoDir },
      (err) => err ? reject(err) : resolve()
    )
  })
}

// ── Iniciar contenedor detenido ───────────────────────────
async function startContainer(containerId) {
  const container = docker.getContainer(containerId)
  await container.start()
  console.log(`[startContainer] ✓ Iniciado ${containerId.slice(0, 12)}`)
}

// ── Iniciar compose detenido ──────────────────────────────
async function startCompose(repoDir, projectName) {
  return new Promise((resolve, reject) => {
    exec(
      `docker-compose -p ${projectName} start`,
      { cwd: repoDir },
      (err) => err ? reject(err) : resolve()
    )
  })
}

// ── Eliminar contenedor e imagen ──────────────────────────
async function removeContainer(containerId, imageTag) {
  try {
    const container = docker.getContainer(containerId)
    await container.stop().catch(() => { })
    await container.remove()
    console.log(`[removeContainer] contenedor eliminado`)
  } catch { }

  try {
    const image = docker.getImage(imageTag)
    await image.remove({ force: true })
    console.log(`[removeContainer] imagen eliminada`)
  } catch { }
}

// ── Eliminar compose ──────────────────────────────────────
async function removeCompose(repoDir, projectName) {
  return new Promise((resolve, reject) => {
    exec(
      `docker-compose -p ${projectName} down --rmi all --volumes`,
      { cwd: repoDir },
      (err, stdout, stderr) => {
        console.log(`[removeCompose] ${stdout}`)
        resolve() // siempre resolver aunque falle
      }
    )
  })
}

// ── Logs ──────────────────────────────────────────────────
async function getContainerLogs(containerId, tail = 100) {
  const container = docker.getContainer(containerId)
  const logs = await container.logs({ stdout: true, stderr: true, tail })
  return logs.toString('utf8')
}

// ── Stats ─────────────────────────────────────────────────
async function getContainerStats(containerId) {
  const container = docker.getContainer(containerId)
  const stats = await container.stats({ stream: false })

  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
  const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100

  return {
    cpu: Math.round(cpuPercent * 100) / 100,
    memoryMB: Math.round(stats.memory_stats.usage / 1024 / 1024),
    memoryLimitMB: Math.round(stats.memory_stats.limit / 1024 / 1024),
    memoryPercent: Math.round((stats.memory_stats.usage / stats.memory_stats.limit) * 100),
  }
}

// ── ¿Está corriendo? ──────────────────────────────────────
async function isContainerRunning(containerId) {
  try {
    const info = await docker.getContainer(containerId).inspect()
    return info.State.Running
  } catch {
    return false
  }
}

module.exports = {
  cloneRepo, detectDeployType,
  buildImage, runContainer,
  runCompose, stopCompose, startCompose, removeCompose,
  stopContainer, startContainer, removeContainer,
  getContainerLogs, getContainerStats, isContainerRunning,
}