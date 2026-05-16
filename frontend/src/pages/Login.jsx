import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import nortLogo from '../assets/nort-logo.png'
import uninorte60 from '../assets/roble-uninorte.png'
import dockerLogo from '../assets/docker-logo.png'
import githubLogo from '../assets/github-logo.png'
import containerLogo from '../assets/container-logo.png'
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

// ── Animated streaks ──────────────────────────────────────
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

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const verified = params.get('verified') === '1'

  const handleChange = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(null) }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Completa todos los campos.'); return }
    setLoading(true)
    try { await login(form.email, form.password); navigate('/dashboard') }
    catch (err) { setError(err.response?.data?.message || 'Credenciales incorrectas.') }
    finally { setLoading(false) }
  }

  return (
    <div className="login-root">
      {/* Animated streaks */}
      <div className="streaks-canvas">
        {STREAKS.map((s, i) => (
          <div
            key={i}
            className="streak-track"
            style={{
              left: s.left,
              top: '-30%',
              transform: `rotate(${s.rot})`,
              opacity: s.op,
            }}
          >
            <div className="streak" style={{
              width: s.width + 'px',
              height: s.height + 'px',
              background: `linear-gradient(180deg, transparent, ${s.color}, transparent)`,
              animationDuration: s.dur,
              animationDelay: s.delay,
            }} />
          </div>
        ))}
      </div>

      <div className="dot-grid" />
      <div className="glow-center" />

      {/* ── LEFT ── */}
      <div className="login-left">
          {/* Brand */}
          <div className="brand">
            <NortLogo size={32} />
            <span className="brand-name">Nort<span> Deploy</span></span>
          </div>

          {/* Hero */}
          <div>
            <div className="eyebrow"><div className="eyebrow-dot" />OpenLab · Universidad del Norte</div>
            <div className="hero">
              <h1 className="hero-title">Tu código,<br />en línea.<br /><span className="hero-gradient">En segundos.</span></h1>
              <p className="hero-sub">Plataforma de hosting académico para desplegar tus proyectos desde GitHub. Cada deploy, en tu propio subdominio.</p>
            </div>

            {/* Terminal */}
            <div className="terminal">
              <div className="terminal-dots">
                <span style={{ background: '#ff5f57' }} /><span style={{ background: '#febc2e' }} /><span style={{ background: '#28c840' }} />
              </div>
              <div className="t-line">api.mei.localhost</div>
              <div className="t-line">portfolio.juan.localhost</div>
              <div className="t-line">quarylogic.ana.localhost<span className="t-cursor" /></div>
            </div>
          </div>

        </div>

        {/* ── RIGHT ── */}
        <div className="login-right">
          <div className="form-card">
            <div className="card-logo"><NortLogo size={52} /></div>
            <h2 className="card-title">Inicia sesión</h2>
            <p className="card-sub">Usa tu cuenta institucional de Uninorte.</p>

            {verified && <div className="verified-banner"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Cuenta verificada. Ya puedes iniciar sesión.</div>}
            {error && <div className="error-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{error}</div>}

            <button className="btn-roble" onClick={() => setShowForm(true)}>
              <img src={openlabLogo} alt="OpenLab" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              Iniciar sesión con Roble
            </button>

            {showForm && (
              <div className="form-fields">
                <form onSubmit={handleSubmit}>
                  <div className="field"><label className="field-label">Correo</label><input className="field-input" type="email" name="email" placeholder="usuario@uninorte.edu.co" value={form.email} onChange={handleChange} autoFocus /></div>
                  <div className="field"><label className="field-label">Contraseña</label><input className="field-input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} /></div>
                  <button className="btn-roble" type="submit" disabled={loading}>
                    {loading ? <><div className="spinner" />Entrando...</> : <>Entrar <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>}
                  </button>
                </form>
                <button className="toggle-form" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            )}

            {!showForm && (
              <>
                <div className="or-divider"><div className="or-line" /><span className="or-txt">O</span><div className="or-line" /></div>
                <Link to="/register" className="btn-register">
                  Crear cuenta
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                </Link>
              </>
            )}

            {!showForm && (
              <div className="no-account">
                ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
              </div>
            )}

            <div className="powered-row">
              <em>Powered by Roble</em> · <em style={{ color: '#F5A800' }}>OpenLab Uninorte</em>
            </div>
          </div>
        </div>

        <div className="left-footer">
          <img
            src={uninorte60}
            alt="Uninorte 60 años"
            className="footer-60-logo"
          />
        </div>
      </div>
  )
}
