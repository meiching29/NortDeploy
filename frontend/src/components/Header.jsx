import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import nortLogo from '../assets/nort-logo.png'
import NotificationBell from './NotificationBell'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'
  const lastName = user?.name?.split(' ')[1] || ''

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 h-[60px] bg-ndark/85 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <img src={nortLogo} alt="NortDeploy" className="w-[26px] h-[26px] object-contain" />
        <span className="font-body font-bold text-[17px] tracking-tight text-white">
          Nort<span className="text-nred">Deploy</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="relative">
          <div
            className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl py-[6px] pl-[6px] pr-3 cursor-pointer hover:bg-white/[0.08] transition-all duration-200"
            onClick={() => setOpen(o => !o)}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-nred to-orange-500 flex items-center justify-center text-[11px] font-bold text-white">
              {firstName[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-ntext">{firstName} {lastName}</span>
              <span className="text-[10px] text-ntext-muted">{user?.email || ''}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {open && (
            <div className="absolute top-[calc(100%+8px)] right-0 bg-nsurface border border-white/[0.08] rounded-xl py-1.5 min-w-[160px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-[100] animate-fade-in">
              <div
                className="flex items-center gap-2 px-3 py-[9px] rounded-lg cursor-pointer text-xs font-medium text-red-400 hover:bg-nred/10 transition-all duration-150"
                onClick={handleLogout}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
