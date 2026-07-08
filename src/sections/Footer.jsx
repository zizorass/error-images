import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { bus } from '../lib/bus.js'
import { scrollToTarget } from '../lib/smoothScroll.js'
import KoalaMark from '../components/KoalaMark.jsx'

gsap.registerPlugin(ScrollTrigger)

const MARQUEE = ['Banoffee Pie', 'Salted Caramel', 'Mocha Coconut', 'Sea Salt Caramel']

export default function Footer() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer-reveal',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 70%' } }
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <footer ref={ref} data-theme="footer" className="relative pt-24 pb-10 overflow-hidden">
      {/* flavour marquee */}
      <div className="footer-reveal relative mb-20 -rotate-1 opacity-0">
        <div className="glass-strong py-4 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap w-max">
            {[...Array(2)].map((_, r) => (
              <div key={r} className="flex">
                {[...MARQUEE, ...MARQUEE].map((m, i) => (
                  <span key={`${r}-${i}`} className="mx-6 font-display italic text-koala-gold/80 text-xl flex items-center gap-6">
                    {m} <span className="text-koala-cream/30 not-italic text-sm">🍿</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative" style={{ textShadow: '0 2px 30px rgba(18,12,6,0.7)' }}>
        <div
          className="absolute -inset-x-20 -inset-y-10 blur-3xl -z-10"
          style={{ background: 'radial-gradient(60% 60% at 50% 42%, rgba(18,12,6,0.72), transparent 75%)' }}
          aria-hidden="true"
        />
        <div className="footer-reveal flex justify-center mb-8 opacity-0">
          <KoalaMark className="w-16 h-16 drop-shadow-[0_0_30px_rgba(242,192,115,0.5)]" />
        </div>
        <h2 className="footer-reveal font-display font-black text-4xl sm:text-6xl lg:text-7xl text-koala-cream leading-[0.95] mb-8 opacity-0">
          Movie night will<br />
          <span className="text-gradient-caramel italic">never recover.</span>
        </h2>
        <div className="footer-reveal opacity-0">
          <button
            onClick={() => scrollToTarget('#shop')}
            className="btn-caramel rounded-full px-10 py-5 font-bold text-koala-night text-lg"
          >
            Get the good stuff
          </button>
        </div>

        <div className="footer-reveal mt-20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-koala-cream/40 opacity-0">
          <span>© {new Date().getFullYear()} Joey Koala. Popped with love, eaten with zero regret.</span>
          <div className="flex gap-5">
            {['TikTok', 'Instagram', 'YouTube'].map((s) => (
              <a key={s} href="#" onClick={(e) => e.preventDefault()} className="hover:text-koala-gold transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* giant watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-6 inset-x-0 text-center font-display font-black text-[16vw] leading-none text-koala-gold/[0.05] whitespace-nowrap"
      >
        JOEY KOALA
      </div>
    </footer>
  )
}
