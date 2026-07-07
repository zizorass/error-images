import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { watchState } from '../lib/watchState.js'

gsap.registerPlugin(ScrollTrigger)

export default function CTAFooter() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
      })
      tl.fromTo(watchState.watchPos, { x: 1.5, y: -0.3, z: -0.5 }, { x: 0, y: -0.1, z: 0, ease: 'none' }, 0)
      tl.fromTo(watchState, { watchScale: 0.45 }, { watchScale: 0.95, ease: 'none' }, 0)
      tl.fromTo(watchState.camPos, { x: 0, y: 0, z: 6.5 }, { x: 0, y: 0, z: 5.3, ease: 'none' }, 0)

      gsap.fromTo(
        '.cta-reveal',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.cta-reveal', start: 'top 85%' } }
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative min-h-[80vh] w-full flex flex-col justify-between overflow-hidden tex-noise">
      <div className="absolute inset-0 tex-liquid-chrome opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 pt-40 pb-24">
        <p className="eyebrow mb-6 cta-reveal">Own a Piece of Precision</p>
        <h2 className="font-display text-gradient-metal text-[13vw] md:text-7xl font-light mb-8 cta-reveal">
          Time, Forged.
        </h2>
        <p className="text-white/55 max-w-md mb-10 cta-reveal">
          Five finishes. One uncompromising mechanism. Reserve your CHROME today.
        </p>
        <a
          href="#"
          className="cta-reveal px-10 py-4 bg-white text-black text-sm tracking-widest2 uppercase hover:bg-white/85 transition-colors duration-300"
        >
          Configure Your CHROME
        </a>
      </div>

      <footer className="relative z-20 border-t border-white/10 px-6 md:px-10 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/40 tracking-widest2 uppercase">
          <span className="font-display text-lg tracking-normal normal-case text-white/80">CHROME</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Collection</a>
            <a href="#" className="hover:text-white transition-colors">Heritage</a>
            <a href="#" className="hover:text-white transition-colors">Boutiques</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <span>&copy; {new Date().getFullYear()} CHROME. All rights reserved.</span>
        </div>
      </footer>
    </section>
  )
}
