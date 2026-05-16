const axios = require('axios')
const { ROBLE_DB, ROBLE_TOKEN } = require('../config/env')

const BASE = `${ROBLE_DB}/${ROBLE_TOKEN}`

// Cliente con token de admin del proyecto
// Para operaciones de DB se usa el accessToken del usuario autenticado
function client(accessToken) {
  return axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}

// ── Setup: crear tabla proyectos si no existe ──────────────
async function setupTable(adminToken) {
  try {
    await client(adminToken).post('/create-table', {
      tableName: 'proyectos',
      description: 'Proyectos desplegados por usuarios de NortDeploy',
      columns: [
        { name: 'nombre',             type: 'varchar', isNullable: false },
        { name: 'repo_url',           type: 'varchar', isNullable: false },
        { name: 'tipo',               type: 'varchar', isNullable: false },  // dockerfile | compose
        { name: 'puerto',             type: 'integer', isNullable: false },
        { name: 'estado',             type: 'varchar', isNullable: false },  // online | paused | sleeping | error
        { name: 'usuario_id',         type: 'varchar', isNullable: false },  // _id del usuario en Roble
        { name: 'usuario_email',      type: 'varchar', isNullable: false },
        { name: 'container_id',       type: 'varchar', isNullable: true  },  // ID del contenedor Docker
        { name: 'image_id',           type: 'varchar', isNullable: true  },  // ID de la imagen Docker
        { name: 'subdominio',         type: 'varchar', isNullable: false },  // proyecto.usuario.localhost
        { name: 'ultima_actividad',   type: 'timestamptz', isNullable: true },
        { name: 'repo_dir',           type: 'varchar', isNullable: true  },  // ruta local del repo clonado
      ]
    })
    console.log('✓ Tabla "proyectos" creada en Roble DB')
  } catch (err) {
    // Si ya existe, ignorar el error
    if (err.response?.status === 409 || err.response?.data?.message?.includes('already exists')) {
      console.log('✓ Tabla "proyectos" ya existe en Roble DB')
    } else {
      console.error('✗ Error creando tabla proyectos:', err.response?.data || err.message)
    }
  }
}

// ── CRUD de proyectos ──────────────────────────────────────

async function getProjects(accessToken, usuarioId) {
  const res = await client(accessToken).get('/read', {
    params: { tableName: 'proyectos', usuario_id: usuarioId }
  })
  return res.data
}

async function getProjectById(accessToken, projectId) {
  const res = await client(accessToken).get('/read', {
    params: { tableName: 'proyectos', _id: projectId }
  })
  return res.data[0] || null
}

async function createProject(accessToken, data) {
  const res = await client(accessToken).post('/insert', {
    tableName: 'proyectos',
    records: [{
      nombre:           data.nombre,
      repo_url:         data.repo_url,
      tipo:             data.tipo,
      puerto:           data.puerto,
      estado:           'online',
      usuario_id:       data.usuario_id,
      usuario_email:    data.usuario_email,
      container_id:     data.container_id || null,
      image_id:         data.image_id || null,
      subdominio:       data.subdominio,
      ultima_actividad: new Date().toISOString(),
      repo_dir:         data.repo_dir || null,
    }]
  })
  return res.data.inserted[0]
}

async function updateProject(accessToken, projectId, updates) {
  const res = await client(accessToken).put('/update', {
    tableName: 'proyectos',
    idColumn:  '_id',
    idValue:   projectId,
    updates:   { ...updates, ultima_actividad: new Date().toISOString() }
  })
  return res.data
}

async function deleteProject(accessToken, projectId) {
  const res = await client(accessToken).delete('/delete', {
    data: { tableName: 'proyectos', idColumn: '_id', idValue: projectId }
  })
  return res.data
}

// Obtener todos los proyectos activos (para el cron de inactividad)
async function getAllActiveProjects(accessToken) {
  const res = await client(accessToken).get('/read', {
    params: { tableName: 'proyectos', estado: 'online' }
  })
  return res.data
}

module.exports = {
  setupTable,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getAllActiveProjects,
}