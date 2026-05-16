import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../api/roble'
import nortLogo from '../assets/nort-logo.png'
import uninorte60 from '../assets/roble-uninorte.png'
import robleLogo from '../assets/roble-logo.png'
import openlabLogo from '../assets/openlab-logo.png'
import '../../styles.css'

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

const STREAKS = [
  { left: '38%', width: 2, height: 280, color: 'rgba(200,32,46,0.7)', rot: '-28deg', dur: '3.2s', delay: '0s', op: 0.6 },
  { left: '42%', width: 1, height: 180, color: 'rgba(255,107,0,0.5)', rot: '-28deg', dur: '4.1s', delay: '0.8s', op: 0.45 },
  { left: '46%', width: 3, height: 320, color: 'rgba(245,168,0,0.6)', rot: '-28deg', dur: '2.8s', delay: '1.4s', op: 0.55 },
  { left: '50%', width: 1.5, height: 200, color: 'rgba(200,32,46,0.4)', rot: '-28deg', dur: '5s', delay: '0.3s', op: 0.35 },
  { left: '54%', width: 2, height: 250, color: 'rgba(255,107,0,0.65)', rot: '-28deg', dur: '3.6s', delay: '2s', op: 0.5 },
  { left: '58%', width: 1, height: 160, color: 'rgba(245,168,0,0.4)', rot: '-28deg', dur: '4.5s', delay: '1s', op: 0.3 },
  { left: '34%', width: 1.5, height: 220, color: 'rgba(255,107,0,0.35)', rot: '-28deg', dur: '5.5s', delay: '1.8s', op: 0.3 },
  { left: '62%', width: 2.5, height: 300, color: 'rgba(200,32,46,0.5)', rot: '-28deg', dur: '3.9s', delay: '0.6s', op: 0.45 },
]

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [resending, setResending] = useState(false)

  const handleCodeChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...code]; next[i] = val; setCode(next)
    if (val && i < 5) document.getElementById(`vc${i + 1}`)?.focus()
  }

  const handleVerify = async e => {
    e.preventDefault()
    const full = code.join('')
    if (full.length < 6) { setError('Ingresa los 6 dígitos del código.'); return }
    if (!email) { setError('Correo no especificado.'); return }
    setLoading(true)
    try {
      await authAPI.verifyEmail(email, full)
      navigate('/login?verified=1')
    } catch (err) {
      setError(err.response?.data?.message || 'Código incorrecto o expirado.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResending(true); setError(null); setSuccess(null)
    try {
      await authAPI.register(email, 'resend', 'User')
      setSuccess('Código reenviado a ' + email)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="login-root">
      <div className="streaks-canvas">
        {STREAKS.map((s, i) => (
          <div key={i} className="streak-track" style={{
            left: s.left, top: '-30%',
            transform: `rotate(${s.rot})`,
            opacity: s.op,
          }}>
            <div className="streak" style={{
              width: s.width + 'px', height: s.height + 'px',
              background: `linear-gradient(180deg, transparent, ${s.color}, transparent)`,
              animationDuration: s.dur, animationDelay: s.delay,
            }} />
          </div>
        ))}
      </div>

      <div className="dot-grid" />
      <div className="glow-center" />

      <div className="login-left">
        <div className="brand">
          <NortLogo size={32} />
          <span className="brand-name">Nort<span> Deploy</span></span>
        </div>

        <div>
          <div className="eyebrow"><div className="eyebrow-dot" />Verificación · OpenLab Uninorte</div>
          <div className="hero">
            <h1 className="hero-title">Confirma tu<br />correo electrónico.<br /><span className="hero-gradient">Listo para desplegar.</span></h1>
            <p className="hero-sub">Hemos enviado un código de 6 dígitos a tu correo institucional. Revisa tu bandeja de entrada o spam.</p>
          </div>

            <div className="tech-row">
              {[
                { label: 'Correo', icon: 'mail' },
                { label: 'Código', icon: 'key' },
                { label: 'Verificación', icon: 'check' },
                { label: 'Roble', icon: robleLogo },
                { label: 'OpenLab', icon: openlabLogo },
              ].map(t => (
                <div className="tech-pill" key={t.label}>
                  {typeof t.icon === 'string' ? (
                    <svg className="tech-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {t.icon === 'mail' && <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4l-10 8L2 4" /></>}
                      {t.icon === 'key' && <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4-4" /><path d="M11 11l-4 4" /><path d="M15 7l-4 4" /></>}
                      {t.icon === 'check' && <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>}
                    </svg>
                  ) : (
                    <img className="tech-logo" src={t.icon} alt={t.label} />
                  )}
                  {t.label}
                </div>
              ))}
            </div>

          <div className="terminal">
            <div className="terminal-dots">
              <span style={{ background: '#ff5f57' }} /><span style={{ background: '#febc2e' }} /><span style={{ background: '#28c840' }} />
            </div>
            <div className="t-line">Verificando correo...</div>
            <div className="t-line">Código enviado a {email}<span className="t-cursor" /></div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="form-card">
          <div className="card-logo"><NortLogo size={52} /></div>
          <h2 className="card-title">Código de verificación</h2>
          <p className="card-sub">Ingresa el código enviado a <strong style={{ color: '#94a3b8' }}>{email || 'tu correo'}</strong></p>

          {success && <div className="verified-banner"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>{success}</div>}
          {error && <div className="error-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{error}</div>}

          <form onSubmit={handleVerify}>
            <div className="code-grid">
              {code.map((c, i) => (
                <input key={i} id={`vc${i}`} className="code-cell" maxLength={1} value={c}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => e.key === 'Backspace' && !c && i > 0 && document.getElementById(`vc${i - 1}`)?.focus()}
                  placeholder="·"
                />
              ))}
            </div>
            <button className="btn-roble" type="submit" disabled={loading || !email}>
              {loading ? <><div className="spinner" />Verificando...</> : <>Verificar <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>}
            </button>
            <button type="button" className="toggle-form" style={{ marginTop: 12 }} onClick={handleResend} disabled={resending}>
              {resending ? 'Reenviando...' : '¿No llegó el código? Reenviar'}
            </button>
          </form>

          <div className="no-account" style={{ borderTop: 'none', marginTop: 16, paddingTop: 0 }}>
            ¿Ya verificaste? <Link to="/login">Inicia sesión</Link>
          </div>

          <div className="powered-row">
            <em>Powered by Roble</em> · <em style={{ color: '#F5A800' }}>OpenLab Uninorte</em>
          </div>
        </div>
      </div>

      <div className="left-footer">
        <img src={uninorte60} alt="Uninorte 60 años" className="footer-60-logo" />
      </div>
    </div>
  )
}
