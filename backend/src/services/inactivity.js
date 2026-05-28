const cron = require('node-cron')
const { stopContainer, stopCompose } = require('./docker')
const { updateProject } = require('./robleDB')
const { releasePort } = require('../utils/ports')
const { INACTIVITY_MINUTES } = require('../config/env')

let adminToken = null

function setAdminToken(token) {
  adminToken = token
  console.log('[inactivity] adminToken actualizado')
}

function startInactivityWatcher(getProjectsFn) {
  console.log(`[inactivity] Watcher activo — umbral de inactividad: ${INACTIVITY_MINUTES} min`)

  cron.schedule('* * * * *', async () => {
    const now = new Date()
    console.log(`[inactivity] Cron tick — ${now.toTimeString().slice(0, 8)}`)

    if (!adminToken) {
      console.log('[inactivity] WARN: adminToken no disponible, saltando ciclo')
      return
    }

    try {
      console.log('[inactivity] Token disponible, buscando proyectos online...')
      const projects = await getProjectsFn(adminToken)
      console.log(`[inactivity] Proyectos online encontrados: ${projects.length}`)

      const limitMs = INACTIVITY_MINUTES * 60 * 1000

      for (const project of projects) {
        if (project.estado !== 'online') continue
        if (!project.ultima_actividad) {
          console.log(`[inactivity] "${project.nombre}" sin ultima_actividad, skip`)
          continue
        }

        const inactiveMs = now - new Date(project.ultima_actividad)
        const inactiveMin = (inactiveMs / 60000).toFixed(1)

        console.log(`[inactivity] Revisando "${project.nombre}" — inactivo: ${inactiveMin} min (límite: ${INACTIVITY_MINUTES} min)`)

        if (inactiveMs < limitMs) {
          console.log(`[inactivity] "${project.nombre}" activo (${inactiveMin} min < ${INACTIVITY_MINUTES} min), skip`)
          continue
        }

        console.log(`[inactivity] Apagando "${project.nombre}" (tipo: ${project.tipo}, ${inactiveMin} min inactivo)...`)

        try {
          if (project.tipo === 'compose') {
            await stopCompose(project.repo_dir, project.image_id)
          } else {
            await stopContainer(project.container_id)
          }
        } catch (stopErr) {
          console.log(`[inactivity] Advertencia al detener "${project.nombre}": ${stopErr.message} — marcando sleeping de todas formas`)
        }

        try {
          releasePort(project.puerto)
          await updateProject(adminToken, project._id, { estado: 'sleeping' })
          console.log(`[inactivity] ✓ "${project.nombre}" marcado como sleeping`)
        } catch (updateErr) {
          console.error(`[inactivity] ✗ Error actualizando estado de "${project.nombre}": ${updateErr.message}`)
        }
      }
    } catch (err) {
      console.error('[inactivity] Error en watcher:', err.message)
    }
  })
}

async function touchProject(projectId, accessToken) {
  try {
    await updateProject(accessToken, projectId, {
      ultima_actividad: new Date().toISOString()
    })
  } catch {}
}

module.exports = { startInactivityWatcher, setAdminToken, touchProject }
