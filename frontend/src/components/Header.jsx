import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import nortLogo from '../assets/nort-logo.png'

function NortLogo({ size = 40 }) {
  return (
    <img
      src={nortLogo}
      alt="NortDeploy Logo"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        filter: 'drop-shadow(0 0 12px rgba(255,107,0,0.25))'
      }}
    />
  )
}

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'
  const lastName = user?.name?.split(' ')[1] || ''

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <>
      <header className="header">
        <div className="header-brand" onClick={() => navigate('/dashboard')}>
          <NortLogo size={26} />
          <span className="header-brand-name">Nort<span> Deploy</span></span>
        </div>
        <div className="header-right">
          <div className="notif-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <div className="notif-dot" />
          </div>
          <div className="user-chip-wrap">
            <div className="user-chip" onClick={() => setOpen(o => !o)}>
              <div className="user-avatar">{firstName[0]?.toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{firstName} {lastName}</span>
                <span className="user-email">{user?.email || ''}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {open && (
              <div className="logout-menu">
                <div className="logout-item" onClick={handleLogout}>
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
    </>
  )
}