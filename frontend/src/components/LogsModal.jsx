import { useState, useEffect } from 'react'
import { projectsAPI } from '../api/projects'

export default function LogsModal({ projectId, onClose }) {
  const [logs, setLogs] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    projectsAPI.logs(projectId)
      .then(res => { if (!cancelled) setLogs(res.data.logs || 'Sin logs disponibles.') })
      .catch(() => { if (!cancelled) setLogs('Error al cargar logs.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [projectId])

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal logs-modal">
          <div className="modal-header">
            <h3 className="modal-title">Logs del contenedor</h3>
            <button className="modal-close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <pre className="logs-content">{loading ? 'Cargando logs...' : logs}</pre>
        </div>
      </div>
    </>
  )
}
