const { BASE_PORT } = require('../config/env')

// Puertos actualmente en uso (en memoria + sincronizados con DB al arrancar)
const usedPorts = new Set()

function reservePort(port) {
  usedPorts.add(port)
}

function releasePort(port) {
  usedPorts.delete(port)
}

function getNextPort() {
  let port = BASE_PORT
  while (usedPorts.has(port)) port++
  return port
}

// Inicializar con puertos ya ocupados desde la DB
function initPorts(projects) {
  projects.forEach(p => {
    if (p.puerto) usedPorts.add(p.puerto)
  })
  console.log(`✓ Puertos reservados: ${[...usedPorts].join(', ') || 'ninguno'}`)
}

module.exports = { getNextPort, reservePort, releasePort, initPorts }