import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authAPI } from '../api/roble'
import nortLogo from '../assets/nort-logo.png'
import openlabLogo from '../assets/openlab-logo.png'
import BackgroundOrb from '../components/BackgroundOrb'

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

  const handleVerify = async (e) => {
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
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (!email) return
    setResending(true); setError(null); setSuccess(null)
    try {
      await authAPI.register(email, 'resend', 'User')
      setSuccess('Código reenviado a ' + email)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código.')
    } finally { setResending(false) }
  }

  return (
    <div className="min-h-screen bg-ndark flex flex-col items-center justify-center relative px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-nred/[0.02] via-transparent to-ngold/[0.01] pointer-events-none" />

      <BackgroundOrb intensity={1.5} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-8 flex items-center gap-2 z-10"
      >
        <img src={nortLogo} alt="NortDeploy" className="w-6 h-6 object-contain" />
        <span className="font-body font-bold text-base text-white tracking-tight">
          Nort<span className="text-nred">Deploy</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-nsurface/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-10 relative">
          <Link
            to="/"
            className="absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center text-ntext-muted/30 hover:text-ntext hover:bg-white/[0.04] transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <div className="text-center mb-7">
            <img src={nortLogo} alt="NortDeploy" className="w-11 h-11 object-contain mx-auto mb-3" />
            <h1 className="font-body font-bold text-xl text-white mb-1">Código de verificación</h1>
            <p className="font-body text-sm text-ntext-muted">
              Ingresa el código enviado a{' '}
              <span className="text-white/60">{email || 'tu correo'}</span>
            </p>
          </div>

          {success && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-body mb-5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              {success}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-body mb-5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="flex gap-2 justify-center">
              {code.map((c, i) => (
                <input
                  key={i}
                  id={`vc${i}`}
                  className="w-11 h-12 text-center font-mono text-lg font-bold bg-transparent border-b-2 border-white/10 text-white outline-none focus:border-nred transition-colors duration-200 placeholder:text-white/20"
                  maxLength={1}
                  value={c}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => e.key === 'Backspace' && !c && i > 0 && document.getElementById(`vc${i - 1}`)?.focus()}
                  placeholder="·"
                />
              ))}
            </div>
            <button type="submit" disabled={loading || !email}
              className="w-full py-3 rounded-xl font-body font-semibold text-sm text-white border border-nred/30 bg-nred/[0.08] hover:bg-nred/20 hover:border-nred disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verificando...</> : 'Verificar código'}
            </button>
            <button type="button" onClick={handleResend} disabled={resending}
              className="text-center font-body text-xs text-ntext-muted/50 hover:text-ntext-muted transition-colors bg-transparent border-none cursor-pointer disabled:opacity-40"
            >
              {resending ? 'Reenviando...' : '¿No llegó el código? Reenviar'}
            </button>
          </form>

          <p className="text-center font-body text-xs text-ntext-muted/60 mt-6">
            ¿Ya verificaste?{' '}
            <Link to="/login" className="text-nred font-semibold hover:text-nred-hover transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 font-mono text-[10px] text-ntext-muted/30">
          <span>Powered by Roble</span>
          <span className="text-white/10">·</span>
          <span className="text-ngold/40">
            <img src={openlabLogo} alt="OpenLab" className="w-3 h-3 object-contain inline-block align-middle mr-1" />
          </span>
        </div>
      </motion.div>
    </div>
  )
}
