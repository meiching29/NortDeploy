import StatusBadge from './StatusBadge'

export default function ProjectCard({ project, onAction }) {
  const { id, name, url, repo, type, port, status } = project

  return (
    <div
      className={`bg-nsurface border border-white/[0.04] rounded-2xl p-5 flex flex-col gap-3 cursor-pointer 
        transition-all duration-250 hover:-translate-y-1 hover:bg-nsurface/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        ${status === 'online' ? 'border-l-2 border-l-green-500' : ''}
        ${status === 'paused' ? 'border-l-2 border-l-ngold' : ''}
        ${status === 'sleeping' ? 'border-l-2 border-l-ntext-muted' : ''}
        ${status === 'error' ? 'border-l-2 border-l-nred' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-body font-bold text-[15px] text-white tracking-tight">{name}</span>
        <StatusBadge status={status} />
      </div>

      <div className="font-mono text-[11px] text-ntext-muted">
        <a href={`http://${url}`} target="_blank" rel="noopener noreferrer"
          className="text-ntext-muted hover:text-blue-400 transition-colors duration-150 no-underline">
          {url}
        </a>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-ntext-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60 shrink-0">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          {repo}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ntext-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60 shrink-0">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          {type}<span className="text-white/10 mx-1">·</span>Puerto {port}
        </div>
      </div>

      <div className="h-[1px] bg-white/[0.03]" />

      <div className="flex items-center gap-1">
        {status === 'online' ? (
          <button className="action-btn" title="Pausar" onClick={() => onAction(id, 'stop')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        ) : (
          <button className="action-btn text-green-500 hover:bg-green-500/12 hover:border-green-500/20 hover:text-green-400 hover:shadow-[0_0_16px_rgba(34,197,94,0.12)]" title="Activar" onClick={() => onAction(id, 'start')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        )}

        <button className="action-btn text-red-400 hover:bg-nred/15 hover:border-nred/25 hover:text-red-300 hover:shadow-[0_0_16px_rgba(200,32,46,0.12)]" title="Eliminar" onClick={() => onAction(id, 'remove')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>

        <button className="action-btn text-blue-400 hover:bg-blue-500/12 hover:border-blue-500/20 hover:text-blue-300 hover:shadow-[0_0_16px_rgba(96,165,250,0.12)]" title="Abrir enlace" onClick={e => { e.stopPropagation(); window.open(`http://${url}`, '_blank') }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>

        <button className="action-btn text-ngold hover:bg-ngold/12 hover:border-ngold/20 hover:text-amber-400 hover:shadow-[0_0_16px_rgba(245,168,0,0.12)]" title="Editar" onClick={e => { e.stopPropagation(); onAction(id, 'edit') }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <button className="action-btn text-purple-400 hover:bg-purple-500/12 hover:border-purple-500/20 hover:text-purple-300 hover:shadow-[0_0_16px_rgba(167,139,250,0.12)]" title="Ver logs" onClick={e => { e.stopPropagation(); onAction(id, 'logs') }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </button>
      </div>
    </div>
  )
}
