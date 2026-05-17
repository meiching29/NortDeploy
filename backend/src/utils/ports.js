const { BASE_PORT } = require('../config/env')

// Puertos actualmente en uso (en memoria + sincronizados con DB al arrancar)
const usedPorts = new Set()

function reservePort(port) {
  usedPorts.add(port)
}

function releasePort(port) {
  usedPorts.delete(port)
}

function getNextPort(slots = 1) {
  let port = BASE_PORT
  while ([...Array(slots)].some((_, i) => usedPorts.has(port + i))) port += slots
  return port
}

// Inicializar con puertos ya ocupados desde la DB
function initPorts(projects) {
  // Reservar puertos del sistema que NortDeploy usa internamente
  usedPorts.add(3000)  // frontend
  usedPorts.add(4000)  // backend
  usedPorts.add(80)    // caddy (proxy)
  usedPorts.add(443)   // https

  projects.forEach(p => {
    if (p.puerto) usedPorts.add(p.puerto)
  })

  console.log(`✓ Puertos reservados del sistema: 3000, 4000, 80, 443`)
  console.log(`✓ Puertos reservados de proyectos: ${projects.map(p => p.puerto).join(', ') || 'ninguno'}`)
}

module.exports = { getNextPort, reservePort, releasePort, initPorts }