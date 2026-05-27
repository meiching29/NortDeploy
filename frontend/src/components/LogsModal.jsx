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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-nsurface border border-white/[0.08] rounded-2xl p-8 w-full max-w-2xl animate-slide-up shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-body font-bold text-xl text-white tracking-tight">Logs del contenedor</h3>
          <button className="w-8 h-8 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center cursor-pointer text-ntext-muted hover:bg-white/[0.1] hover:text-ntext transition-all duration-150" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <pre className="bg-[#0A0C10]/90 border border-white/[0.06] rounded-xl p-4 font-mono text-xs leading-relaxed text-ntext-muted max-h-[400px] overflow-auto whitespace-pre-wrap break-all">
          {loading ? 'Cargando logs...' : logs}
        </pre>
      </div>
    </div>
  )
}
