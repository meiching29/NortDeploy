const cron = require('node-cron')
const { stopContainer } = require('./docker')
const { updateProject } = require('./robleDB')
const { releasePort } = require('../utils/ports')
const { INACTIVITY_MINUTES } = require('../config/env')

// Token de admin para operaciones del sistema
// Se inicializa al arrancar el servidor
let adminToken = null

function setAdminToken(token) {
  adminToken = token
}

// ── Cron job: cada 5 minutos revisa inactividad ────────────
function startInactivityWatcher(getProjectsFn) {
  console.log(`✓ Watcher de inactividad activo (${INACTIVITY_MINUTES} min)`)

  cron.schedule('*/5 * * * *', async () => {
    if (!adminToken) return

    try {
      const projects = await getProjectsFn(adminToken)
      const now = new Date()
      const limitMs = INACTIVITY_MINUTES * 60 * 1000

      for (const project of projects) {
        if (project.estado !== 'online') continue
        if (!project.ultima_actividad) continue

        const lastActivity = new Date(project.ultima_actividad)
        const inactiveMs = now - lastActivity

        if (inactiveMs >= limitMs) {
          console.log(`[inactivity] Apagando ${project.nombre} (${Math.round(inactiveMs / 60000)} min inactivo)`)

          try {
            if (project.container_id) {
              await stopContainer(project.container_id)
              releasePort(project.puerto)
            }
            await updateProject(adminToken, project._id, { estado: 'sleeping' })
          } catch (err) {
            console.error(`[inactivity] Error apagando ${project.nombre}:`, err.message)
          }
        }
      }
    } catch (err) {
      console.error('[inactivity] Error en watcher:', err.message)
    }
  })
}

// ── Actualizar última actividad al recibir request ─────────
async function touchProject(projectId, accessToken) {
  try {
    await updateProject(accessToken, projectId, {
      ultima_actividad: new Date().toISOString()
    })
  } catch {}
}

module.exports = { startInactivityWatcher, setAdminToken, touchProject }