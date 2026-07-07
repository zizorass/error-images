import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { watchState } from '../lib/watchState.js'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 1 },
      })
      tl.fromTo(watchState.watchPos, { x: 1.15, y: -0.05, z: 0.5 }, { x: 1.3, y: -0.15, z: 0, ease: 'none' }, 0)
      tl.fromTo(watchState, { watchScale: 0.92 }, { watchScale: 0.85, ease: 'none' }, 0)
      tl.fromTo(watchState.camPos, { x: 0, y: 0, z: 5.7 }, { x: 0, y: 0, z: 5.4, ease: 'none' }, 0)
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden tex-noise">
      <div className="absolute inset-0 tex-liquid-chrome opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black" />

      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col justify-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="eyebrow mb-6"
        >
          The CHROME Collection — MMXXVI
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5 }}
          className="font-display text-gradient-metal text-[15vw] md:text-[8.5vw] leading-[0.9] font-light max-w-4xl"
        >
          Precision
          <br />
          Beyond Time
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-8 max-w-md text-white/60 font-light leading-relaxed"
        >
          Every CHROME watch is forged from aerospace titanium and finished by
          hand — a mechanism engineered to outlast the moments it measures.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.15 }}
          className="mt-10 flex items-center gap-6"
        >
          <a
            href="#collection"
            className="px-8 py-3 border border-white/30 text-sm tracking-widest2 uppercase hover:bg-white hover:text-black transition-colors duration-500"
          >
            Explore the Collection
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 text-white/40"
      >
        <span className="text-[0.65rem] tracking-widest2 uppercase">Scroll</span>
        <span className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
      </motion.div>
    </section>
  )
}
