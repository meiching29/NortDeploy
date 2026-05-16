import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import ProjectCard from '../components/ProjectCard'
import NewProjectModal from '../components/NewProjectModal'
import '../../styles.css'

const MOCK = [
  { id: 1, name: 'mi-portafolio',  url: 'mi-portafolio.mei.localhost',  repo: 'github.com/mei/mi-portafolio', type: 'Dockerfile',     port: 3000, status: 'online'   },
  { id: 2, name: 'blog-personal',  url: 'blog-personal.mei.localhost',  repo: 'github.com/mei/blog',          type: 'Docker Compose', port: 8080, status: 'paused'   },
  { id: 3, name: 'tienda-online',  url: 'tienda-online.mei.localhost',  repo: 'github.com/mei/tienda',        type: 'Dockerfile',     port: 8000, status: 'sleeping' },
  { id: 4, name: 'api-notas',      url: 'api-notas.mei.localhost',      repo: 'github.com/mei/api-notas',     type: 'Dockerfile',     port: 5000, status: 'online'   },
  { id: 5, name: 'proyecto-ia',    url: 'proyecto-ia.mei.localhost',    repo: 'github.com/mei/proyecto-ia',   type: 'Docker Compose', port: 5001, status: 'error'    },
]

const STAT_CONFIG = [
  { key: 'online',   label: 'Activos',     badge: 'En línea',        color: '#22c55e', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { key: 'paused',   label: 'Pausados',    badge: 'Sin tráfico',     color: '#F5A800', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A800" strokeWidth="1.8" strokeLinecap="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg> },
  { key: 'sleeping', label: 'Dormidos',    badge: 'Se reactivan solos', color: '#94a3b8', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
  { key: 'error',    label: 'Con errores', badge: 'Requiere atención', color: '#ff6b6b', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState(MOCK)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.repo.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    online:   projects.filter(p => p.status === 'online').length,
    paused:   projects.filter(p => p.status === 'paused').length,
    sleeping: projects.filter(p => p.status === 'sleeping').length,
    error:    projects.filter(p => p.status === 'error').length,
  }

  const handleDeploy = async (formData) => {
    // TODO: conectar con projects.js API
    const newProject = {
      id: Date.now(),
      name: formData.name,
      url: formData.url,
      repo: formData.repo,
      type: formData.type === 'dockerfile' ? 'Dockerfile' : 'Docker Compose',
      port: parseInt(formData.port) || 3000,
      status: 'online',
    }
    setProjects(p => [...p, newProject])
  }

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'

  return (
    <>
      <div className="dash-root">
        <div className="amb-tr"/><div className="amb-bl"/><div className="dot-grid"/>

        <Header />

        <main className="main">
          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-greeting">¡Hola, {firstName}! 👋</h1>
              <p className="page-sub">Aquí tienes un resumen de tus proyectos.</p>
            </div>
            <button className="btn-new" onClick={() => setShowModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
                    <div className="stat-badge-dot" style={{ background: s.color }}/>
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
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="search-input" placeholder="Buscar proyecto..." value={search} onChange={e => setSearch(e.target.value)}/>
              </div>
              <div className="view-btns">
                <div className="view-btn active">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div className="view-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="projects-grid">
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
            <div className="new-project-card" onClick={() => setShowModal(true)}>
              <div className="new-project-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span className="new-project-label">Nuevo proyecto</span>
            </div>
          </div>
        </main>

        {showModal && (
          <NewProjectModal
            onClose={() => setShowModal(false)}
            onDeploy={handleDeploy}
            userName={user?.name}
          />
        )}
      </div>
    </>
  )
}