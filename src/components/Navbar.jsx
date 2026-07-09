import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bus } from '../lib/bus.js'
import { scrollToTarget } from '../lib/smoothScroll.js'
import { isMuted, setMuted, unlockAudio } from '../lib/audio.js'
import KoalaMark from './KoalaMark.jsx'

const LINKS = [
  { label: 'Flavours', target: '#flavours' },
  { label: 'Shop', target: '#shop' },
  { label: 'Our Story', target: '#story' },
]

export default function Navbar({ cartCount, onCartOpen }) {
  const [jiggle, setJiggle] = useState(0)
  const [muted, setMutedState] = useState(isMuted())
  const cartRef = useRef(null)

  useEffect(() => {
    return bus.on('cart:add', () => setJiggle((j) => j + 1))
  }, [])

  useEffect(() => {
    // The fly-to-cart animation needs to know where the cart lives.
    const report = () => {
      const r = cartRef.current?.getBoundingClientRect()
      if (r) bus.emit('cart:position', { x: r.left + r.width / 2, y: r.top + r.height / 2 })
    }
    report()
    window.addEventListener('resize', report)
    const off = bus.on('cart:where', report)
    return () => {
      window.removeEventListener('resize', report)
      off()
    }
  }, [])

  const toggleMute = () => {
    unlockAudio()
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed top-4 inset-x-0 z-50 flex justify-center px-4"
    >
      <nav className="glass-strong rounded-full pl-4 pr-2 py-2 flex items-center gap-2 sm:gap-6 shadow-caramel">
        <button
          onClick={() => scrollToTarget(0)}
          className="flex items-center gap-2.5 group"
          aria-label="Back to top"
        >
          <motion.span whileHover={{ rotate: -12, scale: 1.15 }} className="inline-block">
            <KoalaMark className="w-8 h-8" />
          </motion.span>
          <span className="font-display font-bold text-lg tracking-wide text-koala-cream hidden sm:inline">
            Joey&nbsp;Koala
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollToTarget(l.target)}
              className="relative px-4 py-2 text-sm font-medium text-koala-cream/70 hover:text-koala-gold transition-colors rounded-full group"
            >
              {l.label}
              <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-koala-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-koala-cream/70 hover:text-koala-gold transition-colors"
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          >
            {muted ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3l3.2-3.2 1.4 1.4L17.9 13.4l3.2 3.2-1.4 1.4-3.2-3.2-3.2 3.2-1.4-1.4 3.2-3.2-3.2-3.2 1.4-1.4 3.2 3.2z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.47 4.47 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" /></svg>
            )}
          </button>

          <button
            ref={cartRef}
            key={jiggle}
            onClick={onCartOpen}
            id="cart-button"
            className={`relative w-11 h-11 rounded-full btn-caramel flex items-center justify-center text-koala-night ${jiggle ? 'cart-jiggle' : ''}`}
            aria-label="Open cart"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.2 14.6 7.1 15a1 1 0 0 0 1 1H19v2H8.1a3 3 0 0 1-2.9-3.7L6.6 8 5.3 4H2V2h4.7l1.4 4H21a1 1 0 0 1 1 1.2l-1.5 6a2 2 0 0 1-2 1.5H7.9l-.7-.1z" />
            </svg>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-koala-cream text-koala-night text-[11px] font-bold flex items-center justify-center border-2 border-koala-night"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>
    </motion.header>
  )
}
