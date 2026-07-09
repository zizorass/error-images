import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { scrollToTarget } from '../lib/smoothScroll.js'

const HEADLINE = ['CARAMEL,', 'DIRECTED.']

function MagneticButton({ children, className, onClick }) {
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left - r.width / 2
    const y = e.clientY - r.top - r.height / 2
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`
  }
  const onLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, clearProps: 'transform', duration: 0.6, ease: 'elastic.out(1,0.4)' })
  }
  return (
    <button ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} onClick={onClick} className={className}>
      {children}
    </button>
  )
}

export default function Hero({ started }) {
  const root = useRef(null)

  useEffect(() => {
    if (!started) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-letter',
        { yPercent: 120, opacity: 0, rotateX: -60 },
        { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.1, stagger: 0.045, ease: 'power4.out', delay: 0.15 }
      )
      gsap.fromTo(
        '.hero-fade',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.7 }
      )
    }, root)
    return () => ctx.revert()
  }, [started])

  return (
    <section
      ref={root}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ textShadow: '0 2px 30px rgba(18,12,6,0.55)' }}
    >
      {/* soft vignette to keep the headline readable over the glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(70% 55% at 50% 42%, rgba(18,12,6,0.42), transparent 72%)' }}
        aria-hidden="true"
      />
      <p className="hero-fade text-koala-gold tracking-widest2 uppercase text-xs sm:text-sm mb-6 opacity-0">
        Gourmet caramel popcorn · Small-batch · Ridiculously cinematic
      </p>

      <h1 className="font-display font-black leading-[0.92] tracking-tight select-none" style={{ perspective: '800px' }}>
        {HEADLINE.map((word, wi) => (
          <span key={word} className="block overflow-hidden pb-1 whitespace-nowrap">
            {word.split('').map((ch, i) => (
              <span
                key={i}
                className={`hero-letter inline-block text-[12.5vw] sm:text-[11vw] lg:text-[9vw] opacity-0 will-change-transform ${
                  wi === 1 ? 'text-gradient-caramel' : 'text-koala-cream'
                }`}
              >
                {ch}
              </span>
            ))}
          </span>
        ))}
      </h1>

      <p className="hero-fade mt-8 max-w-md text-koala-cream/65 text-base sm:text-lg leading-relaxed opacity-0">
        Four flavours, popped in micro-batches and drowned in slow-simmered caramel.
        This is popcorn with a director's cut.
      </p>

      <div className="hero-fade mt-10 flex flex-wrap items-center justify-center gap-4 opacity-0">
        <MagneticButton
          onClick={() => scrollToTarget('#flavours')}
          className="btn-caramel rounded-full px-8 py-4 font-bold text-koala-night"
        >
          Taste the flavours
        </MagneticButton>
        <MagneticButton
          onClick={() => scrollToTarget('#shop')}
          className="btn-ghost rounded-full px-8 py-4 font-semibold text-koala-cream border border-koala-cream/25"
        >
          Shop now
        </MagneticButton>
      </div>

      <div className="hero-fade absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0">
        <span className="text-[10px] tracking-widest2 uppercase text-koala-cream/40">Scroll to roll camera</span>
        <div className="w-6 h-10 rounded-full border border-koala-cream/25 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-koala-gold animate-bounce" />
        </div>
      </div>
    </section>
  )
}
