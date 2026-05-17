import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import ProjectCard from '../components/ProjectCard'
import NewProjectModal from '../components/NewProjectModal'
import EditProjectModal from '../components/EditProjectModal'
import LogsModal from '../components/LogsModal'
import { projectsAPI } from '../api/projects'
import '../../styles.css'

const STAT_CONFIG = [
  { key: 'online', label: 'Activos', badge: 'En línea', color: '#22c55e', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
  { key: 'paused', label: 'Pausados', badge: 'Sin tráfico', color: '#F5A800', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A800" strokeWidth="1.8" strokeLinecap="round"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg> },
  { key: 'sleeping', label: 'Dormidos', badge: 'Se reactivan solos', color: '#94a3b8', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg> },
  { key: 'error', label: 'Con errores', badge: 'Requiere atención', color: '#ff6b6b', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
]

// Normalizar proyecto de Roble DB al formato que usan los componentes
function normalizeProject(p) {
  return {
    id: p._id,
    name: p.nombre,
    url: p.subdominio,
    repo: p.repo_url,
    type: p.tipo === 'dockerfile' ? 'Dockerfile' : 'Docker Compose',
    port: p.puerto,
    status: p.estado,
    containerId: p.container_id,
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [logsProjectId, setLogsProjectId] = useState(null)
  const [error, setError] = useState(null)

  // Cargar proyectos del backend
  async function fetchProjects() {
    setLoading(true)
    try {
      const res = await projectsAPI.list()
      setProjects(res.data.map(normalizeProject))
    } catch (err) {
      setError('No se pudieron cargar los proyectos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.repo.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    online: projects.filter(p => p.status === 'online').length,
    paused: projects.filter(p => p.status === 'paused').length,
    sleeping: projects.filter(p => p.status === 'sleeping').length,
    error: projects.filter(p => p.status === 'error').length,
  }

  async function handleDeploy(formData) {
    const res = await projectsAPI.create({
      nombre: formData.name,
      repo_url: formData.repo,
      tipo: formData.type,
      puerto: parseInt(formData.port) || 3000,
    })
    setProjects(prev => [...prev, normalizeProject(res.data)])
  }

  async function handleAction(projectId, action) {
    try {
      if (action === 'start') await projectsAPI.start(projectId)
      if (action === 'stop') await projectsAPI.stop(projectId)
      if (action === 'remove') await projectsAPI.remove(projectId)
      if (action === 'edit') {
        const p = projects.find(pj => pj.id === projectId)
        if (p) setEditingProject(p)
        return
      }
      if (action === 'logs') {
        setLogsProjectId(projectId)
        return
      }
      await fetchProjects()
    } catch (err) {
      setError(`Error al ejecutar la acción: ${err.response?.data?.message || err.message}`)
    }
  }

  async function handleSaveEdit(projectId, formData) {
    try {
      await projectsAPI.update(projectId, {
        nombre: formData.name,
        repo_url: formData.repo,
        tipo: formData.type,
      })
      await fetchProjects()
    } catch (err) {
      setError(`Error al guardar cambios: ${err.response?.data?.message || err.message}`)
    }
  }

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'

  return (
    <>
      <div className="dash-root">
        <div className="amb-tr" /><div className="amb-bl" /><div className="dot-grid" />
        <Header />

        <main className="main">
          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-greeting">¡Hola, {firstName}! </h1>
              <p className="page-sub">Aquí tienes un resumen de tus proyectos.</p>
            </div>
            <button className="btn-new" onClick={() => setShowModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo proyecto
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {STAT_CONFIG.map(s => (
              <div className="stat-card" key={s.key}>
                <div className="stat-icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
                <div>
                  <div className="stat-num">{counts[s.key]}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-badge" style={{ color: s.color }}>
                    <div className="stat-badge-dot" style={{ background: s.color }} />
                    {s.badge}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Projects header */}
          <div className="projects-header">
            <h2 className="projects-title">Tus proyectos</h2>
            <div className="projects-controls">
              <div className="search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="search-input" placeholder="Buscar proyecto..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="view-btns">
                <div className="view-btn active">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div className="view-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="projects-grid">
              {[1, 2, 3].map(i => <div key={i} className="skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            // Empty state centrado
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <div className="empty-title">No hay proyectos aún</div>
              <div className="empty-sub">Despliega tu primer proyecto desde GitHub con un clic.</div>
              <button className="btn-new" onClick={() => setShowModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Crear mi primer proyecto
              </button>
            </div>
          ) : (
              <>
                {filtered.map(p => (
                  <ProjectCard key={p.id} project={p} onAction={handleAction} />
                ))}
                <div className="new-project-card" onClick={() => setShowModal(true)}>
                  <div className="new-project-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <span className="new-project-label">Nuevo proyecto</span>
                </div>
              </>
            )}
        </main>

        {showModal && (
          <NewProjectModal
            onClose={() => setShowModal(false)}
            onDeploy={handleDeploy}
            userName={user?.name}
          />
        )}

        {editingProject && (
          <EditProjectModal
            project={editingProject}
            onClose={() => setEditingProject(null)}
            onSave={handleSaveEdit}
          />
        )}

        {logsProjectId && (
          <LogsModal
            projectId={logsProjectId}
            onClose={() => setLogsProjectId(null)}
          />
        )}

        {error && (
          <div className="error-toast">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button className="toast-close" onClick={() => setError(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  )
}