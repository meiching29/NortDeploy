import StatusBadge from './StatusBadge'

export default function ProjectCard({ project, onAction }) {
  const { id, name, url, repo, type, port, status } = project

  return (
    <>
      <div className={`project-card status-${status}`}>
        <div className="pc-top">
          <span className="pc-name">{name}</span>
          <StatusBadge status={status} />
        </div>

        <div className="pc-url">
          <a href={`http://${url}`} target="_blank" rel="noopener noreferrer">{url}</a>
        </div>

        <div className="pc-meta">
          <div className="pc-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            {repo}
          </div>
          <div className="pc-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            {type}<span className="pc-meta-sep">·</span>Puerto {port}
          </div>
        </div>

        <div className="pc-divider" />

        <div className="pc-actions">
          {/* Pausar / Activar */}
          {status === 'online' ? (
            <button className="pc-btn" title="Pausar" onClick={() => onAction(id, 'stop')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          ) : (
            <button className="pc-btn success" title="Activar" onClick={() => onAction(id, 'start')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          )}

          {/* Eliminar */}
          <button className="pc-btn danger" title="Eliminar" onClick={() => onAction(id, 'remove')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>

          {/* Ver enlace */}
          <button className="pc-btn link" title="Abrir enlace" onClick={e => { e.stopPropagation(); window.open(`http://${url}`, '_blank') }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>

          {/* Editar */}
          <button className="pc-btn edit" title="Editar" onClick={e => { e.stopPropagation(); onAction(id, 'edit') }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Terminal */}
          <button className="pc-btn terminal" title="Ver logs" onClick={e => { e.stopPropagation(); onAction(id, 'logs') }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
