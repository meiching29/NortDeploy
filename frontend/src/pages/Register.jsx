import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api/roble'
import nortLogo from '../assets/nort-logo.png'
import uninorte60 from '../assets/roble-uninorte.png'
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

const STEPS = [
  { label: 'Datos de cuenta', desc: 'Nombre, correo y contraseña' },
  { label: 'Verificar correo', desc: 'Código de 6 dígitos enviado a tu email' },
]

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(null) }

  const handleCodeChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...code]; next[i] = val; setCode(next)
    if (val && i < 5) document.getElementById(`c${i + 1}`)?.focus()
  }

  const handleRegister = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Completa todos los campos.'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    try {
      await authAPI.register(form.email, form.password, form.name)
      setSuccess('Código enviado a ' + form.email)
      setStep(2)
      setError(null)
    } catch (err) { setError(err.response?.data?.message || 'Error al crear la cuenta.') }
    finally { setLoading(false) }
  }

  const handleVerify = async e => {
    e.preventDefault()
    const full = code.join('')
    if (full.length < 6) { setError('Ingresa los 6 dígitos del código.'); return }
    setLoading(true)
    try { await authAPI.verifyEmail(form.email, full); navigate('/login?verified=1') }
    catch (err) { setError(err.response?.data?.message || 'Código incorrecto.') }
    finally { setLoading(false) }
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
          <div className="eyebrow"><div className="eyebrow-dot" />Registro · OpenLab Uninorte</div>
          <div className="hero">
            <h1 className="hero-title">Crea tu cuenta<br />y despliega.<br /><span className="hero-gradient">En segundos.</span></h1>
            <p className="hero-sub">Usa tu correo institucional @uninorte.edu.co para comenzar.</p>

            <div className="steps-section" style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {STEPS.map((s, i) => {
                  const idx = i + 1
                  const done = idx < step
                  const active = idx === step
                  const color = done ? '#22c55e' : active ? '#C8202E' : '#475569'
                  const bg = done ? 'rgba(34,197,94,0.10)' : active ? 'rgba(200,32,46,0.10)' : 'rgba(255,255,255,0.03)'
                  const border = done ? 'rgba(34,197,94,0.25)' : active ? 'rgba(200,32,46,0.25)' : 'rgba(255,255,255,0.06)'
                  return (
                    <div key={i}
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 10,
                        background: bg, border: `1px solid ${border}`,
                        transition: 'all 0.3s',
                      }}
                    >
                      <div style={{
                        fontSize: 11, fontWeight: 700, color,
                        marginBottom: 2, letterSpacing: '0.05em', textTransform: 'uppercase',
                      }}>
                        {done && <span style={{ marginRight: 4 }}>✓</span>}
                        Paso {idx}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: active ? '#e2e8f0' : done ? '#94a3b8' : '#475569' }}>
                        {s.label}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: step > 1 ? '#22c55e' : step === 1 ? '#C8202E' : '#23262F',
                  transition: 'all 0.4s',
                }} />
                <div style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: step > 2 ? '#22c55e' : step === 2 ? '#C8202E' : '#23262F',
                  transition: 'all 0.4s',
                }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="login-right">
        <div className="form-card">
          <div className="card-logo"><NortLogo size={52} /></div>

          {step === 1 && (
            <>
              <h2 className="card-title">Crear cuenta</h2>
              <p className="card-sub">Usa tu correo institucional @uninorte.edu.co</p>
              {error && <div className="error-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
              <form onSubmit={handleRegister}>
                <div className="field"><label className="field-label">Nombre completo</label><input className="field-input" name="name" placeholder="Juan Pérez" value={form.name} onChange={handleChange}/></div>
                <div className="field"><label className="field-label">Correo institucional</label><input className="field-input" type="email" name="email" placeholder="usuario@uninorte.edu.co" value={form.email} onChange={handleChange}/></div>
                <div className="field"><label className="field-label">Contraseña</label><input className="field-input" type="password" name="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange}/></div>
                <button className="btn-roble" type="submit" disabled={loading}>
                  {loading ? <><div className="spinner"/>Creando cuenta...</> : <>Crear cuenta <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="card-title">Verifica tu correo</h2>
              <p className="card-sub">Código enviado a <strong style={{color:'#94a3b8'}}>{form.email}</strong></p>
              {success && <div className="verified-banner"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{success}</div>}
              {error && <div className="error-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
              <form onSubmit={handleVerify}>
                <div className="code-grid">
                  {code.map((c, i) => (
                    <input key={i} id={`c${i}`} className="code-cell" maxLength={1} value={c}
                      onChange={e => handleCodeChange(i, e.target.value)}
                      onKeyDown={e => e.key === 'Backspace' && !c && i > 0 && document.getElementById(`c${i-1}`)?.focus()}
                      placeholder="·"
                    />
                  ))}
                </div>
                <button className="btn-roble" type="submit" disabled={loading}>
                  {loading ? <><div className="spinner"/>Verificando...</> : <>Verificar y entrar <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
                </button>
                <button type="button" className="toggle-form" style={{ marginTop: 12 }} onClick={() => { setCode(['','','','','','']); setError(null); handleRegister({ preventDefault: ()=>{} }) }}>
                  ¿No llegó el código? Reenviar
                </button>
              </form>
            </>
          )}

          <div className="no-account" style={{ borderTop: 'none', marginTop: 16, paddingTop: 0 }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
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
