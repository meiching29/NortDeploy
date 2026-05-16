import axios from 'axios'
import { getAccessToken } from '../utils/token'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const api = axios.create({ baseURL: API_URL })

// Inyectar el accessToken en cada request
api.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const projectsAPI = {
  // GET /projects — listar proyectos del usuario autenticado
  list: () => api.get('/projects'),

  // POST /projects — crear y desplegar nuevo proyecto
  create: (data) => api.post('/projects', data),

  // POST /projects/:id/start — reactivar
  start: (id) => api.post(`/projects/${id}/start`),

  // POST /projects/:id/stop — pausar
  stop: (id) => api.post(`/projects/${id}/stop`),

  // DELETE /projects/:id — eliminar contenedor e imagen
  remove: (id) => api.delete(`/projects/${id}`),

  // GET /projects/:id/logs — logs del contenedor
  logs: (id) => api.get(`/projects/${id}/logs`),

  // GET /projects/:id/stats — uso de CPU y memoria
  stats: (id) => api.get(`/projects/${id}/stats`),
}