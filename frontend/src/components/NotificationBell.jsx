import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'

const TYPE_CONFIG = {
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  warning: { color: '#F5A800', bg: 'rgba(245,168,0,0.12)' },
  info:    { color: '#00d4ff', bg: 'rgba(0,212,255,0.12)' },
  error:   { color: '#C8202E', bg: 'rgba(200,32,46,0.12)' },
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (diff < 1) return 'hace unos segundos'
  if (diff === 1) return 'hace 1 min'
  return `hace ${diff} min`
}

function TypeIcon({ type }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }
  const stroke = TYPE_CONFIG[type]?.color || '#94a3b8'
  switch (type) {
    case 'success':
      return <svg {...props} stroke={stroke}><polyline points="20 6 9 17 4 12"/></svg>
    case 'warning':
      return <svg {...props} stroke={stroke}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
    case 'info':
      return <svg {...props} stroke={stroke}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    case 'error':
      return <svg {...props} stroke={stroke}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    default:
      return <svg {...props} stroke={stroke}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  }
}

export default function NotificationBell() {
  const { notifications, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const unreadCount = notifications.filter(n => !n.read).length
  const recent = [...notifications].slice(-10).reverse()

  return (
    <div className="relative" ref={ref}>
      <div
        className="w-9 h-9 bg-white/[0.04] border border-white/[0.07] rounded-xl flex items-center justify-center cursor-pointer relative hover:bg-white/[0.08] transition-all duration-200"
        onClick={() => setOpen(o => !o)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-nred rounded-full border-[1.5px] border-ndark" />
        )}
      </div>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[360px] bg-[#0F1117] border border-white/[0.06] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-[100] animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
            <span className="font-body font-bold text-sm text-white">Notificaciones</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-ntext-muted bg-transparent border-none cursor-pointer hover:text-ntext transition-colors duration-150"
                >
                  Marcar todo como leído
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[11px] font-semibold text-ntext-muted bg-transparent border-none cursor-pointer hover:text-nred transition-colors duration-150"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                </svg>
                <span className="mt-3 text-xs text-ntext-muted font-body">No hay notificaciones</span>
              </div>
            ) : (
              recent.map(n => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
                return (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] transition-all duration-150 hover:bg-white/[0.02] ${!n.read ? 'bg-white/[0.015]' : ''}`}>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: cfg.bg }}
                    >
                      <TypeIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-body font-bold text-xs text-white truncate">{n.title}</span>
                        <span className="font-body text-[10px] text-ntext-muted shrink-0">{timeAgo(n.timestamp)}</span>
                      </div>
                      <p className="font-body text-[11px] text-ntext-muted mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
