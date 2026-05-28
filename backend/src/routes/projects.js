const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const rateLimit = require('../middleware/rateLimit')
const db = require('../services/robleDB')
const docker = require('../services/docker')
const caddy = require('../services/caddy')
const { getNextPort, reservePort, releasePort } = require('../utils/ports')
const { touchProject } = require('../services/inactivity')

router.use(auth)

// ── GET /projects ─────────────────────────────────────────
router.get('/', async (req, res) => {
  const { setAdminToken } = require('../services/inactivity')
  setAdminToken(req.accessToken)
  try {
    const projects = await db.getProjects(req.accessToken, req.user._id)
    res.json(projects)
  } catch (err) {
    console.error('[GET /projects]', err.message)
    res.status(500).json({ message: 'Error al obtener proyectos.' })
  }
})

// ── POST /projects ────────────────────────────────────────
router.post('/', rateLimit, async (req, res) => {
  const { nombre, repo_url, tipo, puerto: customPort } = req.body

  if (!nombre || !repo_url) {
    return res.status(400).json({ message: 'nombre y repo_url son obligatorios.' })
  }

  const safeName = nombre.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const projectId = `nd-${req.user._id.slice(0, 6)}-${safeName}-${Date.now()}`
  const imageTag = projectId
  const appPort = parseInt(customPort) || 3000  // puerto INTERNO del contenedor
  const dockerPorts = await docker.getUsedHostPorts()
  let hostPort = getNextPort()
  while (dockerPorts.has(hostPort)) {
    reservePort(hostPort)   // registrar el puerto huérfano para que getNextPort lo salte
    hostPort = getNextPort()
  }
  const userName = req.user.email.split('@')[0].toLowerCase()
  const subdominio = `${safeName}.${userName}.localhost`

  console.log('══════════════════════════════════════════')
  console.log('[POST /projects] Nueva solicitud de despliegue')
  console.log(`  nombre     = ${nombre}`)
  console.log(`  repo_url   = ${repo_url}`)
  console.log(`  tipo       = ${tipo}`)
  console.log(`  appPort    = ${appPort}  (puerto interno del app)`)
  console.log(`  hostPort   = ${hostPort} (puerto externo asignado)`)
  console.log(`  usuario    = ${req.user._id} / ${req.user.email}`)
  console.log('══════════════════════════════════════════')

  reservePort(hostPort)

  try {
    // STEP 1 — Clonar repo
    console.log('[STEP 1] Clonando repo...')
    const repoDir = await docker.cloneRepo(repo_url, projectId)
    console.log(`[STEP 1] ✓ repoDir = ${repoDir}`)

    // STEP 2 — Detectar tipo
    console.log('[STEP 2] Detectando tipo de despliegue...')
    const deployType = tipo || docker.detectDeployType(repoDir)
    if (!deployType) {
      releasePort(hostPort)
      return res.status(400).json({ message: 'No se encontró Dockerfile ni docker-compose.yml en el repositorio.' })
    }
    console.log(`[STEP 2] deployType = ${deployType}`)

    let containerId, imageId

    if (deployType === 'dockerfile') {
      // STEP 3a — Build imagen
      console.log('[STEP 3] Construyendo imagen Docker...')
      await docker.buildImage(repoDir, imageTag)

      // STEP 4a — Correr contenedor
      console.log('[STEP 4] Lanzando contenedor...')
      const result = await docker.runContainer(imageTag, imageTag, hostPort, appPort)
      containerId = result.containerId
      imageId = result.imageId

    } else {
      // STEP 3b — Docker Compose up
      console.log('[STEP 3] Levantando docker-compose...')
      const result = await docker.runCompose(repoDir, imageTag, hostPort)
      containerId = result.containerId
      imageId = result.imageId
    }

    // STEP 5 — Guardar en Roble DB
    console.log('[STEP 5] Guardando en Roble DB...')
    const project = await db.createProject(req.accessToken, {
      nombre: safeName,
      repo_url,
      tipo: deployType,
      puerto: hostPort,
      usuario_id: req.user._id,
      usuario_email: req.user.email,
      container_id: containerId,
      image_id: imageId,
      subdominio,
      repo_dir: repoDir,
    })

    // STEP 6 — Registrar subdominio en Caddy
    console.log('[STEP 6] Registrando subdominio en Caddy...')
    const caddyContainer = deployType === 'dockerfile' ? imageTag : null
    const caddyPort = deployType === 'dockerfile' ? appPort : null
    await caddy.registerRoute(subdominio, hostPort, caddyContainer, caddyPort)

    console.log(`[POST /projects] ✓ Proyecto creado: ${project._id}`)
    res.status(201).json(project)

  } catch (err) {
    releasePort(hostPort)
    console.error('[POST /projects] ✗ ERROR en despliegue:')
    console.error(`  message : ${err.message}`)
    res.status(500).json({ message: `Error al desplegar: ${err.message}` })
  }
})

// ── POST /projects/:id/start ──────────────────────────────
router.post('/:id/start', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })

    if (project.tipo === 'compose') {
      await docker.startCompose(project.repo_dir, project.image_id)
    } else {
      await docker.startContainer(project.container_id)
    }

    reservePort(project.puerto)
    const updated = await db.updateProject(req.accessToken, project._id, { estado: 'online' })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /projects/:id/stop ───────────────────────────────
router.post('/:id/stop', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })

    if (project.tipo === 'compose') {
      await docker.stopCompose(project.repo_dir, project.image_id)
    } else {
      await docker.stopContainer(project.container_id)
    }

    releasePort(project.puerto)
    const updated = await db.updateProject(req.accessToken, project._id, { estado: 'paused' })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── DELETE /projects/:id ──────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })

    if (project.tipo === 'compose') {
      await docker.removeCompose(project.repo_dir, project.image_id)
    } else {
      await docker.removeContainer(project.container_id, project.image_id)
    }

    releasePort(project.puerto)
    await caddy.removeRoute(project.subdominio)
    await db.deleteProject(req.accessToken, project._id)
    res.json({ message: 'Proyecto eliminado.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /projects/:id/logs ────────────────────────────────
router.get('/:id/logs', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })

    const logs = await docker.getContainerLogs(project.container_id)
    //await touchProject(project._id, req.accessToken)
    res.json({ logs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /projects/:id/stats ───────────────────────────────
router.get('/:id/stats', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })
    if (project.estado !== 'online') return res.status(400).json({ message: 'El proyecto no está activo.' })

    const stats = await docker.getContainerStats(project.container_id)
    //await touchProject(project._id, req.accessToken)
    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router