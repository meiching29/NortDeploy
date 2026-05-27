import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function BackgroundOrb({ intensity = 1, className = '' }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 80, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 80, damping: 25 })

  useEffect(() => {
    const handleMouse = (e) => {
      const px = (e.clientX / window.innerWidth - 0.5) * 2
      const py = (e.clientY / window.innerHeight - 0.5) * 2
      mouseX.set(px * 8)
      mouseY.set(py * 8)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const i = intensity

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 m-auto w-[80vw] aspect-square rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, rgba(200,32,46,${0.08 * i}) 0%, rgba(245,168,0,${0.04 * i}) 35%, transparent 65%)`,
          filter: 'blur(80px)',
          x: springX,
          y: springY,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 m-auto w-[45vw] aspect-square rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, rgba(200,32,46,${0.15 * i}) 0%, rgba(232,93,44,${0.08 * i}) 35%, rgba(245,168,0,${0.04 * i}) 60%, transparent 80%)`,
          filter: 'blur(40px)',
          x: springX,
          y: springY,
        }}
        animate={{ scale: [1, 1.03, 0.98, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 m-auto w-[20vw] aspect-square rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, rgba(255,255,255,${0.1 * i}) 0%, rgba(245,168,0,${0.05 * i}) 35%, transparent 65%)`,
          filter: 'blur(12px)',
          x: springX,
          y: springY,
        }}
        animate={{ opacity: [0.3 * i, 0.5 * i, 0.3 * i] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
