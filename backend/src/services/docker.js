const Docker = require('dockerode')
const simpleGit = require('simple-git')
const fs = require('fs')
const path = require('path')
const { REPOS_DIR } = require('../config/env')

// ── Conexión a Docker ──────────────────────────────────────
function createDocker() {
  if (process.env.DOCKER_HOST) {
    const url = new URL(process.env.DOCKER_HOST)
    return new Docker({ host: url.hostname, port: parseInt(url.port) })
  }
  return new Docker({ socketPath: '/var/run/docker.sock' })
}

const docker = createDocker()

// ── Clonar o actualizar repo de GitHub ────────────────────
async function cloneRepo(repoUrl, projectId) {
  const repoDir = path.join(REPOS_DIR, projectId)

  if (fs.existsSync(repoDir)) {
    // Ya existe — hacer pull para actualizar
    console.log(`[${projectId}] Actualizando repo...`)
    const git = simpleGit(repoDir)
    await git.pull()
  } else {
    // Clonar por primera vez
    console.log(`[${projectId}] Clonando repo ${repoUrl}...`)
    fs.mkdirSync(repoDir, { recursive: true })
    await simpleGit().clone(repoUrl, repoDir)
  }

  return repoDir
}

// ── Detectar tipo de despliegue ───────────────────────────
function detectDeployType(repoDir) {
  const hasCompose = fs.existsSync(path.join(repoDir, 'docker-compose.yml')) ||
                     fs.existsSync(path.join(repoDir, 'docker-compose.yaml'))
  const hasDockerfile = fs.existsSync(path.join(repoDir, 'Dockerfile'))

  if (hasCompose) return 'compose'
  if (hasDockerfile) return 'dockerfile'
  return null
}

// ── Build de imagen Docker ────────────────────────────────
async function buildImage(repoDir, imageTag) {
  console.log(`[${imageTag}] Construyendo imagen...`)

  // Leer todos los archivos del contexto
  const buildStream = await docker.buildImage(
    { context: repoDir, src: ['.'] },
    {
      t: imageTag,
      nocache: false,
    }
  )

  // Esperar a que termine el build
  await new Promise((resolve, reject) => {
    docker.modem.followProgress(buildStream, (err, output) => {
      if (err) reject(err)
      else resolve(output)
    })
  })

  console.log(`[${imageTag}] ✓ Imagen construida`)
  return imageTag
}

// ── Correr contenedor ─────────────────────────────────────
async function runContainer(imageTag, containerName, hostPort, appPort = 3000) {
  console.log(`[${containerName}] Lanzando en puerto ${hostPort}...`)

  const container = await docker.createContainer({
    Image: imageTag,
    name: containerName,
    ExposedPorts: { [`${appPort}/tcp`]: {} },
    HostConfig: {
      PortBindings: { [`${appPort}/tcp`]: [{ HostPort: String(hostPort) }] },
      AutoRemove: false,
      // Límites de recursos por contenedor
      Memory: 512 * 1024 * 1024,        // 512 MB máximo
      NanoCpus: 1 * 1e9,                // 1 CPU máximo
      MemorySwap: 512 * 1024 * 1024,    // sin swap extra
    },
  })

  await container.start()
  const info = await container.inspect()

  console.log(`[${containerName}] ✓ Corriendo`)
  return { containerId: info.Id, imageId: info.Image }
}

// ── Detener contenedor ────────────────────────────────────
async function stopContainer(containerId) {
  try {
    const container = docker.getContainer(containerId)
    await container.stop()
    console.log(`[${containerId.slice(0, 12)}] ✓ Detenido`)
  } catch (err) {
    if (!err.message.includes('not running')) throw err
  }
}

// ── Iniciar contenedor detenido ───────────────────────────
async function startContainer(containerId) {
  const container = docker.getContainer(containerId)
  await container.start()
  console.log(`[${containerId.slice(0, 12)}] ✓ Iniciado`)
}

// ── Eliminar contenedor e imagen ──────────────────────────
async function removeContainer(containerId, imageTag) {
  try {
    const container = docker.getContainer(containerId)
    await container.stop().catch(() => {})
    await container.remove()
  } catch {}

  try {
    const image = docker.getImage(imageTag)
    await image.remove({ force: true })
  } catch {}
}

// ── Obtener logs del contenedor ───────────────────────────
async function getContainerLogs(containerId, tail = 100) {
  const container = docker.getContainer(containerId)
  const logs = await container.logs({ stdout: true, stderr: true, tail })
  return logs.toString('utf8')
}

// ── Obtener stats de CPU y memoria ───────────────────────
async function getContainerStats(containerId) {
  const container = docker.getContainer(containerId)
  const stats = await container.stats({ stream: false })

  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
  const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100

  const memUsage = stats.memory_stats.usage
  const memLimit = stats.memory_stats.limit

  return {
    cpu: Math.round(cpuPercent * 100) / 100,
    memoryMB: Math.round(memUsage / 1024 / 1024),
    memoryLimitMB: Math.round(memLimit / 1024 / 1024),
    memoryPercent: Math.round((memUsage / memLimit) * 100),
  }
}

// ── Verificar si un contenedor está corriendo ─────────────
async function isContainerRunning(containerId) {
  try {
    const container = docker.getContainer(containerId)
    const info = await container.inspect()
    return info.State.Running
  } catch {
    return false
  }
}

module.exports = {
  cloneRepo,
  detectDeployType,
  buildImage,
  runContainer,
  stopContainer,
  startContainer,
  removeContainer,
  getContainerLogs,
  getContainerStats,
  isContainerRunning,
}