import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import nortLogo from '../assets/nort-logo.png'
import openlabLogo from '../assets/openlab-logo.png'
import BackgroundOrb from '../components/BackgroundOrb'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const verified = params.get('verified') === '1'

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Completa todos los campos.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ndark flex flex-col items-center justify-center relative px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-nred/[0.02] via-transparent to-ngold/[0.01] pointer-events-none" />

      <BackgroundOrb intensity={1.5} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
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
          <div className="text-center mb-8">
            <img src={nortLogo} alt="NortDeploy" className="w-12 h-12 object-contain mx-auto mb-4" />
            <h1 className="font-body font-bold text-xl text-white mb-1">Inicia sesión</h1>
            <p className="font-body text-sm text-ntext-muted">Usa tu cuenta institucional de Uninorte.</p>
          </div>

          {verified && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-body mb-5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Cuenta verificada. Ya puedes iniciar sesión.
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-body mb-5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block font-body text-xs font-semibold text-ntext-muted uppercase tracking-wider mb-2">
                Correo institucional
              </label>
              <input
                className="w-full bg-transparent border-b border-white/10 pb-2.5 font-body text-sm text-white
                           outline-none transition-colors duration-200
                           focus:border-nred placeholder:text-white/20"
                type="email"
                name="email"
                placeholder="usuario@uninorte.edu.co"
                value={form.email}
                onChange={handleChange}
                autoFocus
              />
            </div>
            <div>
              <label className="block font-body text-xs font-semibold text-ntext-muted uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                className="w-full bg-transparent border-b border-white/10 pb-2.5 font-body text-sm text-white
                           outline-none transition-colors duration-200
                           focus:border-nred placeholder:text-white/20"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-body font-semibold text-sm text-white
                         border border-nred/30 bg-nred/[0.08]
                         hover:bg-nred/20 hover:border-nred
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-300 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Entrando...</>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="text-center font-body text-xs text-ntext-muted/60 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-nred font-semibold hover:text-nred-hover transition-colors">
              Crear cuenta
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
