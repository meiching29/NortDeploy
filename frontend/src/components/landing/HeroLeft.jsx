import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const stagger = {
  animate: {
    transition: { staggerChildren: 0.15, delayChildren: 0.4 },
  },
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function HeroLeft() {
  const navigate = useNavigate()

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="flex flex-col"
    >
      <motion.h1
        variants={fadeUp}
        className="font-slogan text-[clamp(44px,6.5vw,88px)] leading-[1.2] tracking-[0.1em] text-white mb-6"
      >
        <span className="block">DESPLIEGA.</span>
        <span className="block">ESCALA.</span>
        <span
          className="block bg-gradient-to-r from-nred via-orange-500 to-ngold bg-clip-text text-transparent"
          style={{ filter: 'drop-shadow(0 0 24px rgba(200,32,46,0.18))' }}
        >
          INNOVA.
        </span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="font-body text-[15px] md:text-base text-ntext-muted leading-relaxed max-w-md mb-10"
      >
        Plataforma de hosting académico para desplegar tus proyectos desde GitHub.
        Cada deploy, en tu propio subdominio. Diseñado para la comunidad Uninorte.
      </motion.p>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-14">
        <button
          onClick={() => navigate('/register')}
          className="group relative px-8 py-3 rounded-xl font-body font-semibold text-sm text-white
                     border border-nred/40 bg-nred/[0.08]
                     hover:bg-nred/15 hover:border-nred/80
                     hover:shadow-[0_0_24px_rgba(200,32,46,0.3)]
                     transition-all duration-300 ease-out"
        >
          <span className="relative z-10">Comenzar ahora</span>
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 rounded-xl font-body font-medium text-sm text-ntext-muted
                     border border-white/10 bg-white/[0.02]
                     hover:text-white hover:border-white/20 hover:bg-white/[0.05]
                     hover:shadow-[0_0_20px_rgba(245,168,0,0.12)]
                     transition-all duration-300 ease-out"
        >
          Iniciar sesión
        </button>
      </motion.div>
    </motion.div>
  )
}
