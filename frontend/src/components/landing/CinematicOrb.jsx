import { useEffect, useMemo } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CinematicOrb() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 80, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 80, damping: 25 })

  useEffect(() => {
    const handleMouse = (e) => {
      const px = (e.clientX / window.innerWidth - 0.5) * 2
      const py = (e.clientY / window.innerHeight - 0.5) * 2
      mouseX.set(px * 12)
      mouseY.set(py * 12)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const particles = useMemo(() =>
    Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
      color: ['#C8202E', '#F5A800', '#ffffff'][Math.floor(Math.random() * 3)],
    }))
  , [])

  return (
    <div className="fixed right-0 top-0 w-1/2 h-full pointer-events-none z-[1] overflow-hidden">
      <motion.div
        className="absolute inset-0 m-auto w-[85%] aspect-square rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(200,32,46,0.12) 0%, rgba(245,168,0,0.06) 35%, transparent 65%)',
          filter: 'blur(80px)',
          x: springX,
          y: springY,
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 m-auto w-[50%] aspect-square rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(200,32,46,0.2) 0%, rgba(232,93,44,0.12) 35%, rgba(245,168,0,0.06) 60%, transparent 80%)',
          filter: 'blur(40px)',
          x: springX,
          y: springY,
        }}
        animate={{ scale: [1, 1.03, 0.98, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 m-auto w-[22%] aspect-square rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, rgba(245,168,0,0.08) 35%, transparent 65%)',
          filter: 'blur(12px)',
          x: springX,
          y: springY,
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          animate={{
            y: [-40, 40, -40],
            opacity: [0, 0.5, 0],
            scale: [0.2, 1, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
