const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const rateLimit = require('../middleware/rateLimit')
const db = require('../services/robleDB')
const dockerService = require('../services/docker')
const { getNextPort, reservePort, releasePort } = require('../utils/ports')
const { touchProject } = require('../services/inactivity')

// Todas las rutas requieren autenticación
router.use(auth)

// ── GET /projects — listar proyectos del usuario ──────────
router.get('/', async (req, res) => {
  try {
    const projects = await db.getProjects(req.accessToken, req.user._id)
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener proyectos.' })
  }
})

// ── POST /projects — crear y desplegar ───────────────────
router.post('/', rateLimit, async (req, res) => {
  const { nombre, repo_url, tipo, puerto: customPort } = req.body

  if (!nombre || !repo_url) {
    return res.status(400).json({ message: 'nombre y repo_url son obligatorios.' })
  }

  const projectId = `nd-${req.user._id.slice(0, 6)}-${nombre}-${Date.now()}`
  const port = customPort || getNextPort()
  const imageTag = projectId.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const containerName = imageTag
  const userName = req.user.email.split('@')[0].toLowerCase()
  const subdominio = `${nombre}.${userName}.localhost`

  reservePort(port)

  try {
    // 1. Clonar repo
    const repoDir = await dockerService.cloneRepo(repo_url, projectId)

    // 2. Detectar tipo si no se especificó
    const deployType = tipo || dockerService.detectDeployType(repoDir)
    if (!deployType) {
      return res.status(400).json({ message: 'No se encontró Dockerfile ni docker-compose.yml en el repositorio.' })
    }

    // 3. Build de imagen
    await dockerService.buildImage(repoDir, imageTag)

    // 4. Correr contenedor
    const { containerId, imageId } = await dockerService.runContainer(
      imageTag, containerName, port, customPort || 3000
    )

    // 5. Guardar en Roble DB
    const project = await db.createProject(req.accessToken, {
      nombre,
      repo_url,
      tipo:          deployType,
      puerto:        port,
      usuario_id:    req.user._id,
      usuario_email: req.user.email,
      container_id:  containerId,
      image_id:      imageId,
      subdominio,
      repo_dir:      repoDir,
    })

    res.status(201).json(project)

  } catch (err) {
    releasePort(port)
    console.error(`[POST /projects] Error:`, err.message)
    res.status(500).json({ message: `Error al desplegar: ${err.message}` })
  }
})

// ── POST /projects/:id/start — reactivar ─────────────────
router.post('/:id/start', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })

    await dockerService.startContainer(project.container_id)
    reservePort(project.puerto)

    const updated = await db.updateProject(req.accessToken, project._id, { estado: 'online' })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /projects/:id/stop — pausar ─────────────────────
router.post('/:id/stop', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })

    await dockerService.stopContainer(project.container_id)
    releasePort(project.puerto)

    const updated = await db.updateProject(req.accessToken, project._id, { estado: 'paused' })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── DELETE /projects/:id — eliminar ──────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })

    await dockerService.removeContainer(project.container_id, project.image_id)
    releasePort(project.puerto)
    await db.deleteProject(req.accessToken, project._id)

    res.json({ message: 'Proyecto eliminado.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /projects/:id/logs — logs del contenedor ─────────
router.get('/:id/logs', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })

    const logs = await dockerService.getContainerLogs(project.container_id)
    await touchProject(project._id, req.accessToken)
    res.json({ logs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /projects/:id/stats — CPU y memoria ──────────────
router.get('/:id/stats', async (req, res) => {
  try {
    const project = await db.getProjectById(req.accessToken, req.params.id)
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado.' })
    if (project.usuario_id !== req.user._id) return res.status(403).json({ message: 'No autorizado.' })
    if (project.estado !== 'online') return res.status(400).json({ message: 'El proyecto no está activo.' })

    const stats = await dockerService.getContainerStats(project.container_id)
    await touchProject(project._id, req.accessToken)
    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router