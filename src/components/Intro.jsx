import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bus } from '../lib/bus.js'
import { bassHit, unlockAudio } from '../lib/audio.js'
import KoalaMark from './KoalaMark.jsx'

// DOM layer of the opening sequence: logo slam on the boom, white flash,
// skip control. The 3D drama itself lives in Experience.js.
export default function Intro({ onDone }) {
  const [boomed, setBoomed] = useState(false)
  const [gone, setGone] = useState(false)
  const [showSkip, setShowSkip] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 900)
    const offBoom = bus.on('intro:boom', () => {
      bassHit()
      setBoomed(true)
    })
    const offDone = bus.on('intro:done', () => {
      setGone(true)
      onDone()
    })
    return () => {
      clearTimeout(t)
      offBoom()
      offDone()
    }
  }, [onDone])

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center"
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
        >
          {/* flash on impact */}
          <AnimatePresence>
            {boomed && (
              <motion.div
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 bg-koala-gold/80"
              />
            )}
          </AnimatePresence>

          {/* logo slams in with the boom */}
          <AnimatePresence>
            {boomed && (
              <motion.div
                initial={{ scale: 2.6, opacity: 0, filter: 'blur(18px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center gap-4"
              >
                <KoalaMark className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_40px_rgba(242,192,115,0.7)]" />
                <h1 className="font-display font-black text-5xl sm:text-7xl text-gradient-caramel tracking-tight">
                  Joey Koala
                </h1>
                <p className="text-koala-cream/60 tracking-widest2 uppercase text-[11px] sm:text-xs">
                  Gourmet Caramel Popcorn
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* hint + skip */}
          {!boomed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute bottom-24 text-koala-cream/50 text-xs tracking-widest2 uppercase"
            >
              Something is dripping…
            </motion.p>
          )}
          {showSkip && !boomed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                unlockAudio()
                bus.emit('intro:skip')
              }}
              className="absolute bottom-8 right-8 pointer-events-auto text-koala-cream/50 hover:text-koala-gold text-xs tracking-widest2 uppercase border border-koala-cream/20 hover:border-koala-gold/50 rounded-full px-5 py-2.5 transition-colors"
            >
              Skip intro
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
