import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import Header from '../components/Header'
import ProjectCard from '../components/ProjectCard'
import NewProjectModal from '../components/NewProjectModal'
import EditProjectModal from '../components/EditProjectModal'
import LogsModal from '../components/LogsModal'
import ProjectDetail from './ProjectDetail'
import { projectsAPI } from '../api/projects'

const STAT_CONFIG = [
  { key: 'online', label: 'Activos', badge: 'En línea', color: '#22c55e', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
  { key: 'paused', label: 'Pausados', badge: 'Sin tráfico', color: '#F5A800', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A800" strokeWidth="1.8" strokeLinecap="round"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg> },
  { key: 'sleeping', label: 'Dormidos', badge: 'Se reactivan solos', color: '#94a3b8', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg> },
  { key: 'error', label: 'Con errores', badge: 'Requiere atención', color: '#ff6b6b', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
]

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
    ultima_actividad: p.ultima_actividad,
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [logsProjectId, setLogsProjectId] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [error, setError] = useState(null)

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

  useEffect(() => {
    fetchProjects()
    // Polling para detectar cambios de estado (auto-sleep)
    const interval = setInterval(fetchProjects, 10000)
    return () => clearInterval(interval)
  }, [])

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
    const urlPreview = res.data.subdominio || `${formData.name.toLowerCase().replace(/\s+/g, '-')}.proyecto.usuario.localhost`
    addNotification('success', '¡Proyecto desplegado!', `${formData.name} está listo en ${urlPreview}`)
  }

  async function handleAction(projectId, action) {
    try {
      const project = projects.find(pj => pj.id === projectId)
      const projectName = project?.name || 'Proyecto'

      if (action === 'start') {
        await projectsAPI.start(projectId)
        addNotification('success', 'Proyecto activado', `${projectName} está en línea`)
      }
      if (action === 'stop') {
        await projectsAPI.stop(projectId)
        addNotification('warning', 'Proyecto pausado', `${projectName} fue pausado`)
      }
      if (action === 'remove') {
        addNotification('info', 'Proyecto eliminado', `${projectName} fue eliminado`)
        await projectsAPI.remove(projectId)
      }
      if (action === 'edit') {
        const p = projects.find(pj => pj.id === projectId)
        if (p) setEditingProject(p)
        return
      }
      if (action === 'logs') {
        setLogsProjectId(projectId)
        return
      }
      if (action === 'restart') {
        await projectsAPI.stop(projectId)
        await projectsAPI.start(projectId)
      }
      await fetchProjects()
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      setError(`Error al ejecutar la acción: ${msg}`)
      addNotification('error', 'Error', msg)
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
    <div className="min-h-screen bg-ndark flex flex-col relative">
      <div className="fixed top-[-150px] right-[-150px] w-[500px] h-[500px] bg-gradient-to-br from-nred/[0.07] to-transparent rounded-full pointer-events-none" />
      <div className="fixed bottom-[-150px] left-[-150px] w-[400px] h-[400px] bg-gradient-to-tr from-ngold/[0.05] to-transparent rounded-full pointer-events-none" />
      <div className="dot-grid" />
      <Header />

      <main className="flex-1 p-8 max-w-[1200px] w-full mx-auto relative z-10">
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="font-body font-extrabold text-[26px] tracking-tight text-white mb-1">
              ¡Hola, {firstName}!
            </h1>
            <p className="font-body text-sm text-ntext-muted">Aquí tienes un resumen de tus proyectos.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-nred text-white border-none rounded-xl px-5 py-3 text-sm font-bold font-body cursor-pointer transition-all duration-200 hover:bg-nred-hover"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo proyecto
          </button>
        </div>

        {selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onAction={handleAction}
          />
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3 mb-8">
              {STAT_CONFIG.map(s => (
                <div key={s.key}
                  className="bg-nsurface border border-white/[0.04] rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:border-white/[0.08] hover:bg-[#11141B] hover:-translate-y-0.5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}18` }}>
                    {s.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-body font-black text-[28px] tracking-tight text-white leading-none mb-1">{counts[s.key]}</div>
                    <div className="font-body text-sm font-semibold text-ntext-muted mb-1">{s.label}</div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: s.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                      {s.badge}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-body font-bold text-base text-white tracking-tight">Tus proyectos</h2>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 bg-nsurface border border-white/[0.04] rounded-xl py-2 px-3.5 w-[220px] transition-all duration-200 focus-within:border-nred">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input className="bg-transparent border-none outline-none text-sm text-ntext font-body w-full placeholder:text-white/20"
                    placeholder="Buscar proyecto..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-1">
                  <div className="w-8 h-8 bg-[#181C25] border border-white/[0.06] rounded-lg flex items-center justify-center cursor-pointer text-ntext transition-all duration-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 bg-nsurface border border-white/[0.04] rounded-lg flex items-center justify-center cursor-pointer text-ntext-muted hover:text-ntext transition-all duration-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-nsurface border border-white/[0.04] rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-white/[0.04] rounded w-2/3 mb-3" />
                    <div className="h-3 bg-white/[0.03] rounded w-1/2 mb-3" />
                    <div className="h-3 bg-white/[0.03] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/[0.03] rounded w-1/3 mb-4" />
                    <div className="h-[1px] bg-white/[0.03] mb-3" />
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-white/[0.03] rounded-lg" />
                      <div className="w-7 h-7 bg-white/[0.03] rounded-lg" />
                      <div className="w-7 h-7 bg-white/[0.03] rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 min-h-[300px]">
                <div className="w-14 h-14 bg-nred/10 rounded-2xl flex items-center justify-center text-nred mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <h3 className="font-body font-extrabold text-xl tracking-tight text-white mb-2">No hay proyectos aún</h3>
                <p className="font-body text-sm text-ntext-muted mb-6 max-w-[360px]">Despliega tu primer proyecto desde GitHub con un clic.</p>
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-nred text-white border-none rounded-xl px-5 py-3 text-sm font-bold font-body cursor-pointer transition-all duration-200 hover:bg-nred-hover">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Crear mi primer proyecto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filtered.map(p => (
                  <ProjectCard key={p.id} project={p} onAction={handleAction} onSelect={setSelectedProject} />
                ))}
                <div
                  onClick={() => setShowModal(true)}
                  className="bg-nsurface/60 border border-dashed border-white/[0.04] rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 cursor-pointer min-h-[160px] transition-all duration-200 hover:bg-nsurface/80 hover:border-nred"
                >
                  <div className="w-10 h-10 bg-nred/10 rounded-xl flex items-center justify-center text-nred">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <span className="font-body text-sm font-semibold text-ntext-muted">Nuevo proyecto</span>
                </div>
              </div>
            )}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-nred/10 border border-nred/20 rounded-xl px-4 py-3 text-sm text-red-400 font-body animate-slide-up">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button className="ml-2 bg-transparent border-none text-red-400 cursor-pointer p-0.5" onClick={() => setError(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
