import { useState } from 'react'

export default function EditProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState({
    name: project.name || '',
    repo: project.repo || '',
    type: project.type === 'Docker Compose' ? 'compose' : 'dockerfile',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name && !form.repo && !form.type) return
    setLoading(true)
    await onSave(project.id, form)
    setLoading(false)
    onClose()
  }

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-header">
            <h3 className="modal-title">Editar proyecto</h3>
            <button className="modal-close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-field">
              <label className="modal-label">Nombre del proyecto</label>
              <input className="modal-input" placeholder="mi-proyecto" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            </div>
            <div className="modal-field">
              <label className="modal-label">Repositorio de GitHub</label>
              <input className="modal-input" placeholder="https://github.com/usuario/repo"
                value={form.repo} onChange={e => setForm(f => ({ ...f, repo: e.target.value }))} />
            </div>
            <label className="modal-label">Tipo de despliegue</label>
            <div className="type-row">
              <button type="button" className={`type-btn ${form.type === 'dockerfile' ? 'selected' : ''}`}
                onClick={() => setForm(f => ({ ...f, type: 'dockerfile' }))}>
                <div className="type-btn-title">Dockerfile</div>
                <div className="type-btn-desc">Usar Dockerfile</div>
              </button>
              <button type="button" className={`type-btn ${form.type === 'compose' ? 'selected' : ''}`}
                onClick={() => setForm(f => ({ ...f, type: 'compose' }))}>
                <div className="type-btn-title">Docker Compose</div>
                <div className="type-btn-desc">Usar docker-compose.yml</div>
              </button>
            </div>
            <button className="modal-btn" type="submit" disabled={loading}>
              {loading
                ? <><div className="modal-spinner"/>Guardando...</>
                : <>Guardar cambios <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></>
              }
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
