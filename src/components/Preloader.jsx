import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader() {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1400)
      setProgress(p)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setVisible(false), 250)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-6"
        >
          <span className="font-display text-4xl tracking-wide">CHROME</span>
          <div className="w-56 h-px bg-white/15 overflow-hidden">
            <motion.div className="h-full bg-white" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-[0.65rem] tracking-widest2 uppercase text-white/40">
            Assembling the movement — {Math.round(progress * 100)}%
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
