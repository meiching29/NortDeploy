import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import nortLogo from '../../assets/nort-logo.png'

export default function LandingNav() {
  const navigate = useNavigate()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-ndark/70 backdrop-blur-xl border-b border-white/[0.03]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2.5">
          <img src={nortLogo} alt="NortDeploy" className="w-6 h-6 object-contain" />
          <span className="font-body font-bold text-base tracking-tight text-white">
            Nort<span className="text-nred">Deploy</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <span className="font-body text-xs tracking-[0.1em] text-ntext-muted/30 uppercase select-none">
            Plataforma
          </span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 rounded-lg text-sm font-body font-medium text-nred
                     border border-nred/40 bg-nred/[0.04]
                     hover:bg-nred/10 hover:border-nred/70
                     hover:shadow-[0_0_20px_rgba(200,32,46,0.25)]
                     transition-all duration-300 ease-out"
        >
          Iniciar sesión
        </button>
      </div>
    </motion.nav>
  )
}
