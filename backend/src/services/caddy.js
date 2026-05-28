const axios = require('axios')

const CADDY_ADMIN = process.env.CADDY_ADMIN_URL || 'http://localhost:2019'

// ── Registrar subdominio en Caddy ─────────────────────────
// Llama a la API admin de Caddy para agregar una ruta nueva
// subdominio: "demo1.mching.localhost"
// hostPort:   9000
async function registerRoute(subdominio, hostPort, containerName, appPort) {
  const routeId = slugify(subdominio)
  const upstream = containerName && appPort
    ? `${containerName}:${appPort}`
    : `host.docker.internal:${hostPort}`

  const route = {
    '@id': routeId,
    match: [{ host: [subdominio] }],
    handle: [{
      handler: 'reverse_proxy',
      upstreams: [{ dial: `host.docker.internal:${hostPort}` }],
      health_checks: {
        passive: { fail_duration: '30s' }
      }
    }],
    terminal: true
  }

  try {
    // Intentar agregar la ruta al servidor HTTP de Caddy
    await axios.post(
      `${CADDY_ADMIN}/config/apps/http/servers/srv0/routes/0`,
      route,
      { headers: { 'Content-Type': 'application/json' } }
    )
    
    console.log(`[caddy] ✓ Ruta registrada: ${subdominio} → localhost:${hostPort}`)
  } catch (err) {
    // Si el servidor srv0 no existe aún, inicializarlo
    if (err.response?.status === 404) {
      await initCaddyServer(route)
    } else {
      console.error(`[caddy] Error registrando ruta: ${err.response?.data || err.message}`)
      // No lanzar error — el proyecto igual se crea, solo sin subdominio
    }
  }
}

// ── Eliminar subdominio de Caddy ──────────────────────────
async function removeRoute(subdominio) {
  const routeId = slugify(subdominio)
  try {
    await axios.delete(
      `${CADDY_ADMIN}/id/${routeId}`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    console.log(`[caddy] ✓ Ruta eliminada: ${subdominio}`)
  } catch (err) {
    console.error(`[caddy] Error eliminando ruta: ${err.response?.data || err.message}`)
  }
}

// ── Inicializar servidor HTTP en Caddy si no existe ───────
async function initCaddyServer(firstRoute) {
  console.log('[caddy] Inicializando servidor HTTP...')
  try {
    await axios.post(
      `${CADDY_ADMIN}/config/apps/http/servers/srv0`,
      {
        listen: [':80'],
        routes: [firstRoute]
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    console.log('[caddy] ✓ Servidor HTTP inicializado')
  } catch (err) {
    console.error('[caddy] Error inicializando servidor:', err.response?.data || err.message)
  }
}

// ── Verificar si Caddy está disponible ────────────────────
async function isCaddyAvailable() {
  try {
    await axios.get(`${CADDY_ADMIN}/config/`, { timeout: 2000 })
    return true
  } catch {
    return false
  }
}

// ── Helper: convertir subdominio a ID válido ──────────────
function slugify(str) {
  return 'route-' + str.replace(/\./g, '-').replace(/[^a-z0-9-]/g, '')
}

module.exports = { registerRoute, removeRoute, isCaddyAvailable }