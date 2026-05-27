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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-nsurface border border-white/[0.08] rounded-2xl p-8 w-full max-w-md animate-slide-up shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-body font-bold text-xl text-white tracking-tight">Editar proyecto</h3>
          <button className="w-8 h-8 bg-white/[0.05] border border-white/[0.08] rounded-lg flex items-center justify-center cursor-pointer text-ntext-muted hover:bg-white/[0.1] hover:text-ntext transition-all duration-150" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-body text-[11px] font-semibold text-ntext-muted uppercase tracking-wider mb-2">Nombre del proyecto</label>
            <input className="w-full bg-[#0A0C10] border border-white/[0.06] rounded-xl px-3.5 py-[11px] text-sm text-ntext font-body outline-none focus:border-nred transition-colors duration-200 placeholder:text-white/20"
              placeholder="mi-proyecto" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </div>

          <div>
            <label className="block font-body text-[11px] font-semibold text-ntext-muted uppercase tracking-wider mb-2">Repositorio de GitHub</label>
            <input className="w-full bg-[#0A0C10] border border-white/[0.06] rounded-xl px-3.5 py-[11px] text-sm text-ntext font-body outline-none focus:border-nred transition-colors duration-200 placeholder:text-white/20"
              placeholder="https://github.com/usuario/repo" value={form.repo} onChange={e => setForm(f => ({ ...f, repo: e.target.value }))} />
          </div>

          <label className="block font-body text-[11px] font-semibold text-ntext-muted uppercase tracking-wider">Tipo de despliegue</label>
          <div className="grid grid-cols-2 gap-2.5">
            {['dockerfile', 'compose'].map(t => (
              <button key={t} type="button"
                className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                  form.type === t
                    ? 'border-nred bg-nred/[0.08]'
                    : 'border-white/[0.06] bg-[#0A0C10] hover:border-white/10 hover:bg-[#181C25]'
                }`}
                onClick={() => setForm(f => ({ ...f, type: t }))}>
                <div className="font-body text-sm font-bold text-ntext">{t === 'dockerfile' ? 'Dockerfile' : 'Docker Compose'}</div>
                <div className="font-body text-[11px] text-ntext-muted">{t === 'dockerfile' ? 'Usar Dockerfile' : 'Usar docker-compose.yml'}</div>
              </button>
            ))}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-body font-semibold text-sm text-white border border-nred/30 bg-nred/[0.08] hover:bg-nred/20 hover:border-nred disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
            ) : (
              <>Guardar cambios <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
