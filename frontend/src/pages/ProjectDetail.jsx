import { useState, useEffect } from 'react'
import { projectsAPI } from '../api/projects'
import StatusBadge from '../components/StatusBadge'
import { openHttp } from '../utils/openHttp'

function getUptime(lastActivity) {
  if (!lastActivity) return '—'
  const diff = Date.now() - new Date(lastActivity).getTime()
  if (diff < 0) return '0s'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'logs', label: 'Logs' },
  { key: 'recursos', label: 'Recursos' },
  { key: 'configuracion', label: 'Configuración' },
]

export default function ProjectDetail({ project, onClose, onAction }) {
  const { id, name, url, repo, type, port, status, ultima_actividad } = project

  const [activeTab, setActiveTab] = useState('resumen')
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState('')
  const [showAllLogs, setShowAllLogs] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [uptime, setUptime] = useState('—')

  useEffect(() => {
    if (status !== 'online') { setUptime('—'); return }
    const update = () => setUptime(getUptime(ultima_actividad))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [status, ultima_actividad])

  useEffect(() => {
    if (status !== 'online') { setStats(null); return }
    const intervalMs = activeTab === 'recursos' ? 5000 : 10000
    const fetchStats = () => {
      projectsAPI.stats(id).then(r => setStats(r.data)).catch(() => setStats(null))
    }
    fetchStats()
    const interval = setInterval(fetchStats, intervalMs)
    return () => clearInterval(interval)
  }, [id, status, activeTab])

  useEffect(() => {
    if (activeTab !== 'logs') return
    const fetchLogs = () => {
      projectsAPI.logs(id).then(r => setLogs(r.data.logs || '')).catch(() => setLogs('Error al cargar logs.'))
    }
    fetchLogs()
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [id, activeTab])

  useEffect(() => {
    if (!showDropdown) return
    const handler = () => setShowDropdown(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [showDropdown])

  const logLines = logs ? logs.split('\n').filter(Boolean) : []
  const displayedLogs = showAllLogs ? logLines : logLines.slice(-20)
  const httpUrl = `http://${url}`

  function logColor(line) {
    if (/error/i.test(line)) return 'text-red-400'
    if (/warn|warning/i.test(line)) return 'text-yellow-400'
    if (/info/i.test(line)) return 'text-green-400'
    return 'text-ntext-muted'
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onClose}
            className="w-8 h-8 bg-nsurface border border-white/[0.06] rounded-lg flex items-center justify-center cursor-pointer text-ntext-muted hover:text-ntext hover:bg-white/[0.08] transition-all duration-150 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-body font-extrabold text-[22px] text-white tracking-tight">{name}</h1>
              <StatusBadge status={status} />
            </div>
            <a href={`http://${url}`} onClick={e => { e.preventDefault(); openHttp(url) }}
              className="font-mono text-[12px] text-blue-400 hover:text-blue-300 transition-colors duration-150 no-underline cursor-pointer">
              {url}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => openHttp(httpUrl)}
            className="flex items-center gap-1.5 bg-nsurface border border-white/[0.06] rounded-xl px-3.5 py-2 text-xs font-semibold text-ntext font-body cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-150">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Visitar sitio
          </button>

          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setShowDropdown(!showDropdown) }}
              className="flex items-center gap-1.5 bg-nsurface border border-white/[0.06] rounded-xl px-3.5 py-2 text-xs font-semibold text-ntext-muted font-body cursor-pointer hover:text-ntext hover:bg-white/[0.06] transition-all duration-150">
              Más
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1.5 bg-nsurface border border-white/[0.06] rounded-xl py-1.5 min-w-[160px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50">
                <button onClick={() => { setShowDropdown(false); onAction(id, 'logs') }}
                  className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-ntext-muted font-body hover:text-ntext hover:bg-white/[0.04] transition-all duration-100">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                  Ver logs
                </button>
                <button onClick={() => { setShowDropdown(false); onAction(id, 'edit') }}
                  className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-ntext-muted font-body hover:text-ntext hover:bg-white/[0.04] transition-all duration-100">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Editar
                </button>
                <div className="h-[1px] bg-white/[0.04] mx-3 my-1" />
                <button onClick={() => { setShowDropdown(false); onAction(id, 'remove') }}
                  className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-red-400 font-body hover:bg-nred/10 transition-all duration-100">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-white/[0.06] mb-6">
        {TABS.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2.5 text-xs font-bold font-body tracking-wide uppercase transition-all duration-150 border-b-2 -mb-[1px] ${activeTab === tab.key
              ? 'text-white border-nred'
              : 'text-ntext-muted border-transparent hover:text-ntext hover:border-white/10'
              }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'resumen' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-nsurface border border-white/[0.04] rounded-2xl p-5">
            <h3 className="font-body font-bold text-sm text-white tracking-tight mb-4">Estado del contenedor</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-ntext-muted'}`} />
                <span className="font-body text-sm text-ntext">
                  {status === 'online' ? 'Activo' : status === 'paused' ? 'Pausado' : status === 'sleeping' ? 'Dormido' : 'Error'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ntext-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Tiempo activo: <span className="text-ntext font-mono">{uptime}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ntext-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Última actividad: <span className="text-ntext">{formatDate(ultima_actividad)}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-ntext-muted mt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mt-0.5 shrink-0">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span>Auto-apagado: después de 30 min de inactividad</span>
              </div>
            </div>
          </div>

          <div className="bg-nsurface border border-white/[0.04] rounded-2xl p-5">
            <h3 className="font-body font-bold text-sm text-white tracking-tight mb-4">Recursos asignados</h3>
            {status === 'online' && stats ? (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-ntext-muted font-semibold">CPU</span>
                    <span className="text-xs font-mono text-ntext-muted">{stats.cpu.toFixed(1)}% / 1.00 CPU</span>
                  </div>
                  <div className="h-[6px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#00d4ff] transition-all duration-500" style={{ width: `${Math.min(stats.cpu, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-ntext-muted font-semibold">Memoria</span>
                    <span className="text-xs font-mono text-ntext-muted">{stats.memoryMB}MB / {stats.memoryLimitMB}MB</span>
                  </div>
                  <div className="h-[6px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#22c55e] transition-all duration-500" style={{ width: `${stats.memoryPercent}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ntext-muted">El proyecto no está activo.</p>
            )}
          </div>

          <div className="bg-nsurface border border-white/[0.04] rounded-2xl p-5">
            <h3 className="font-body font-bold text-sm text-white tracking-tight mb-4">Información</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ntext-muted shrink-0">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                <a href={repo} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 no-underline transition-colors truncate">{repo}</a>
              </div>
              <div className="flex items-center gap-2 text-ntext-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                {type}
              </div>
              <div className="flex items-center gap-2 text-ntext-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Puerto {port}
              </div>
              <div className="flex items-center gap-2 text-ntext-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Creado: {formatDate(ultima_actividad)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body font-bold text-sm text-white tracking-tight">Logs en tiempo real</h3>
            {logLines.length > 20 && (
              <button onClick={() => setShowAllLogs(!showAllLogs)}
                className="text-xs text-ntext-muted hover:text-ntext font-body bg-transparent border border-white/[0.06] rounded-lg px-3 py-1.5 cursor-pointer transition-all duration-150">
                {showAllLogs ? 'Mostrar últimos 20' : `Ver más logs (${logLines.length} líneas)`}
              </button>
            )}
          </div>
          <pre className="bg-[#0A0C10] border border-white/[0.06] rounded-xl p-4 font-mono text-xs leading-relaxed max-h-[400px] overflow-auto whitespace-pre-wrap break-all">
            {displayedLogs.length === 0 ? (
              <span className="text-ntext-muted">Esperando logs...</span>
            ) : (
              displayedLogs.map((line, i) => (
                <div key={i} className={logColor(line)}>{line}</div>
              ))
            )}
          </pre>
        </div>
      )}

      {activeTab === 'recursos' && (
        <div className="bg-nsurface border border-white/[0.04] rounded-2xl p-6">
          <h3 className="font-body font-bold text-sm text-white tracking-tight mb-5">Uso de recursos</h3>
          {status === 'online' && stats ? (
            <div className="flex flex-col gap-6 max-w-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ntext-muted font-semibold">CPU</span>
                  <span className="text-sm font-mono text-ntext">{stats.cpu.toFixed(1)}% / 1.00 CPU</span>
                </div>
                <div className="h-[10px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#00d4ff] transition-all duration-500" style={{ width: `${Math.min(stats.cpu, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ntext-muted font-semibold">Memoria</span>
                  <span className="text-sm font-mono text-ntext">{stats.memoryMB}MB / {stats.memoryLimitMB}MB</span>
                </div>
                <div className="h-[10px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#22c55e] transition-all duration-500" style={{ width: `${stats.memoryPercent}%` }} />
                </div>
              </div>
              <p className="text-[11px] text-ntext-muted">Actualizando cada 5 segundos...</p>
            </div>
          ) : (
            <p className="text-sm text-ntext-muted">El proyecto no está activo.</p>
          )}
        </div>
      )}

      {activeTab === 'configuracion' && (
        <div className="bg-nsurface border border-white/[0.04] rounded-2xl p-6 max-w-lg">
          <h3 className="font-body font-bold text-sm text-white tracking-tight mb-5">Configuración del proyecto</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-ntext-muted uppercase tracking-wider mb-1.5">Nombre</label>
              <div className="bg-[#0A0C10] border border-white/[0.06] rounded-xl px-3.5 py-[11px] text-sm text-ntext font-mono">{name}</div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ntext-muted uppercase tracking-wider mb-1.5">Repositorio</label>
              <div className="bg-[#0A0C10] border border-white/[0.06] rounded-xl px-3.5 py-[11px] text-sm text-ntext font-mono break-all">{repo}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-ntext-muted uppercase tracking-wider mb-1.5">Tipo</label>
                <div className="bg-[#0A0C10] border border-white/[0.06] rounded-xl px-3.5 py-[11px] text-sm text-ntext font-mono">{type}</div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-ntext-muted uppercase tracking-wider mb-1.5">Puerto</label>
                <div className="bg-[#0A0C10] border border-white/[0.06] rounded-xl px-3.5 py-[11px] text-sm text-ntext font-mono">{port}</div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ntext-muted uppercase tracking-wider mb-1.5">Subdominio</label>
              <div className="bg-[#0A0C10] border border-white/[0.06] rounded-xl px-3.5 py-[11px] text-sm text-ntext font-mono">{url}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
