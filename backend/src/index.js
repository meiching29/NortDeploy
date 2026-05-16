const express = require('express')
const cors = require('cors')
const { PORT, ROBLE_TOKEN } = require('./config/env')
const { setupTable, getAllActiveProjects } = require('./services/robleDB')
const { initPorts } = require('./utils/ports')
const { startInactivityWatcher } = require('./services/inactivity')
const projectsRouter = require('./routes/projects')

const app = express()

// ── Middleware global ──────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NortDeploy API', token: ROBLE_TOKEN })
})

// ── Rutas ──────────────────────────────────────────────────
app.use('/projects', projectsRouter)

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Ruta ${req.method} ${req.path} no encontrada.` })
})

// ── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  res.status(500).json({ message: 'Error interno del servidor.' })
})

// ── Arranque ───────────────────────────────────────────────
async function bootstrap() {
  console.log('\n🚀 Iniciando NortDeploy Backend...')
  console.log(`   Roble token: ${ROBLE_TOKEN}`)

  // Para el setup inicial necesitamos un token de admin
  // En producción esto vendría de una variable de entorno
  // Por ahora el setup de tabla se intenta con un token dummy
  // (si falla, la tabla ya existe o se crea manualmente en Roble)
  try {
    // Intentar setup de la tabla — solo funciona si ADMIN_TOKEN está definido
    if (process.env.ADMIN_TOKEN) {
      await setupTable(process.env.ADMIN_TOKEN)

      // Cargar puertos en uso desde proyectos existentes
      const projects = await getAllActiveProjects(process.env.ADMIN_TOKEN)
      initPorts(projects)

      // Iniciar watcher de inactividad
      const { setAdminToken } = require('./services/inactivity')
      setAdminToken(process.env.ADMIN_TOKEN)
      startInactivityWatcher((token) => getAllActiveProjects(token))
    } else {
      console.log('⚠ ADMIN_TOKEN no definido — setup automático deshabilitado')
      console.log('  Crea la tabla "proyectos" manualmente en Roble o define ADMIN_TOKEN')
      initPorts([])
    }
  } catch (err) {
    console.error('Error en bootstrap:', err.message)
    initPorts([])
  }

  app.listen(PORT, () => {
    console.log(`\n✓ Backend corriendo en http://localhost:${PORT}`)
    console.log(`  Endpoints disponibles:`)
    console.log(`  GET    /health`)
    console.log(`  GET    /projects`)
    console.log(`  POST   /projects`)
    console.log(`  POST   /projects/:id/start`)
    console.log(`  POST   /projects/:id/stop`)
    console.log(`  DELETE /projects/:id`)
    console.log(`  GET    /projects/:id/logs`)
    console.log(`  GET    /projects/:id/stats\n`)
  })
}

bootstrap()