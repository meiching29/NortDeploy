import { useState } from 'react'

export default function NewProjectModal({ onClose, onDeploy, userName }) {
  const [form, setForm] = useState({ name: '', repo: '', type: 'dockerfile', port: '3000' })
  const [loading, setLoading] = useState(false)

  const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const user = userName?.split(' ')[0]?.toLowerCase() || 'usuario'
  const urlPreview = slug ? `${slug}.${user}.localhost` : `mi-proyecto.${user}.localhost`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.repo) return
    setLoading(true)
    await onDeploy({ ...form, name: slug, url: urlPreview })
    setLoading(false)
    onClose()
  }

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-header">
            <h3 className="modal-title">Nuevo proyecto</h3>
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
            <div className="url-preview">
              <div className="url-preview-label">Vista previa de tu URL</div>
              <div className="url-preview-value">{urlPreview}</div>
              <div className="url-preview-hint">Tu proyecto estará disponible en este subdominio.</div>
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
            <div className="modal-field">
              <label className="modal-label">Puerto a exponer</label>
              <input className="modal-input" placeholder="3000" value={form.port}
                onChange={e => setForm(f => ({ ...f, port: e.target.value }))} />
            </div>
            <button className="modal-btn" type="submit" disabled={loading || !form.name || !form.repo}>
              {loading
                ? <><div className="modal-spinner"/>Desplegando...</>
                : <>Desplegar proyecto <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></>
              }
            </button>
          </form>
        </div>
      </div>
    </>
  )
}