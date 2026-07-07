import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

// 3D-tilting card with a cursor-tracked specular highlight — used for
// collection cards and feature tiles throughout the site.
export default function TiltCard({ children, className = '', glare = true }) {
  const ref = useRef(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const springX = useSpring(x, { stiffness: 220, damping: 22 })
  const springY = useSpring(y, { stiffness: 220, damping: 22 })

  const rotateX = useTransform(springY, [0, 1], [10, -10])
  const rotateY = useTransform(springX, [0, 1], [-12, 12])
  const glareX = useTransform(springX, [0, 1], ['0%', '100%'])
  const glareY = useTransform(springY, [0, 1], ['0%', '100%'])

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  function handleLeave() {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform([glareX, glareY], ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.35), transparent 55%)`),
          }}
        />
      )}
    </motion.div>
  )
}
