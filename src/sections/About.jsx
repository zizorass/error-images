import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { bus } from '../lib/bus.js'

gsap.registerPlugin(ScrollTrigger)

// Pinned visual storytelling: kernel → pop → caramel → packet.
// The scrub timeline crossfades four illustrated stages while the copy swaps.
const STAGES = [
  {
    id: 'kernel',
    title: 'It starts with one kernel.',
    copy: 'Non-GMO butterfly corn, grown slow and picked at peak crunch. We reject 40% of every harvest. The kernels take it personally.',
  },
  {
    id: 'pop',
    title: 'Then physics happens.',
    copy: 'Each kernel hits 180°C and explodes to forty times its size. We pop in micro-batches so every piece gets its moment.',
  },
  {
    id: 'caramel',
    title: 'Enter the caramel.',
    copy: 'Butter, muscovado and patience, simmered to exactly 118°C. Poured by hand while it still moves like liquid gold.',
  },
  {
    id: 'packet',
    title: 'Sealed at peak crunch.',
    copy: 'From copper pan to sealed packet in under an hour. What reaches you is the popcorn equivalent of a film still in motion.',
  },
]

function StageVisual({ stage }) {
  switch (stage) {
    case 'kernel':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <ellipse cx="100" cy="110" rx="34" ry="44" fill="url(#kernelg)" />
          <ellipse cx="100" cy="110" rx="34" ry="44" fill="none" stroke="#7a4a12" strokeWidth="2" opacity="0.4" />
          <ellipse cx="88" cy="92" rx="9" ry="14" fill="rgba(255,255,255,0.35)" />
          <defs>
            <linearGradient id="kernelg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffd873" /><stop offset="1" stopColor="#b26a12" />
            </linearGradient>
          </defs>
        </svg>
      )
    case 'pop':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {[...Array(10)].map((_, i) => {
            const a = (i / 10) * Math.PI * 2
            return (
              <line
                key={i}
                x1={100 + Math.cos(a) * 46} y1={100 + Math.sin(a) * 46}
                x2={100 + Math.cos(a) * 78} y2={100 + Math.sin(a) * 78}
                stroke="#f2c073" strokeWidth="5" strokeLinecap="round" opacity="0.85"
              />
            )
          })}
          <circle cx="100" cy="100" r="30" fill="#fbf3e4" />
          <circle cx="82" cy="88" r="16" fill="#f6ecd8" />
          <circle cx="118" cy="90" r="14" fill="#fefaf0" />
          <circle cx="100" cy="118" r="15" fill="#f2e6cc" />
        </svg>
      )
    case 'caramel':
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M60 20 C60 60 82 54 82 90 C82 116 74 126 74 150" stroke="url(#pourg)" strokeWidth="14" fill="none" strokeLinecap="round" />
          <ellipse cx="100" cy="160" rx="64" ry="20" fill="url(#poolg)" />
          <ellipse cx="80" cy="154" rx="12" ry="4" fill="rgba(255,235,190,0.5)" />
          <defs>
            <linearGradient id="pourg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2c073" /><stop offset="1" stopColor="#a35f0d" /></linearGradient>
            <linearGradient id="poolg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e0a04a" /><stop offset="1" stopColor="#7a4a12" /></linearGradient>
          </defs>
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M58 44 L142 44 L150 58 C158 100 158 150 148 176 C144 188 134 194 100 194 C66 194 56 188 52 176 C42 150 42 100 50 58 Z" fill="url(#pktg)" />
          <path d="M54 34 L146 34 L143 48 L57 48 Z" fill="#7a4a12" />
          <circle cx="100" cy="112" r="34" fill="rgba(18,12,6,0.75)" />
          <circle cx="88" cy="102" r="7" fill="#f2c073" />
          <circle cx="112" cy="102" r="7" fill="#f2c073" />
          <ellipse cx="100" cy="114" rx="13" ry="12" fill="#f2c073" />
          <defs>
            <linearGradient id="pktg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2c073" /><stop offset="1" stopColor="#8a4d0f" /></linearGradient>
          </defs>
        </svg>
      )
  }
}

export default function About() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const mm = gsap.matchMedia()
    const build = (pin) => {
      const stages = el.querySelectorAll('.stage')
      const texts = el.querySelectorAll('.stage-text')
      gsap.set(stages, { autoAlpha: 0, scale: 0.7, rotate: -8 })
      gsap.set(texts, { autoAlpha: 0, y: 40 })
      gsap.set(stages[0], { autoAlpha: 1, scale: 1, rotate: 0 })
      gsap.set(texts[0], { autoAlpha: 1, y: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: pin ? '+=2600' : 'bottom bottom',
          scrub: 0.8,
          pin,
        },
      })
      for (let i = 1; i < STAGES.length; i++) {
        tl.to(stages[i - 1], { autoAlpha: 0, scale: 1.25, rotate: 8, duration: 1 }, i)
          .to(texts[i - 1], { autoAlpha: 0, y: -40, duration: 1 }, i)
          .to(stages[i], { autoAlpha: 1, scale: 1, rotate: 0, duration: 1 }, i + 0.15)
          .to(texts[i], { autoAlpha: 1, y: 0, duration: 1 }, i + 0.15)
      }
      tl.to({}, { duration: 0.6 })
    }
    mm.add('(min-width: 768px)', () => build(true))
    mm.add('(max-width: 767px)', () => build(true))
    return () => mm.revert()
  }, [])

  return (
    <section ref={ref} id="story" data-theme="about" className="relative min-h-screen overflow-hidden">
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <p className="text-koala-gold tracking-widest2 uppercase text-xs mb-10">How it's made</p>

        <div className="relative w-56 h-56 sm:w-72 sm:h-72 mb-10">
          {STAGES.map((s) => (
            <div key={s.id} className="stage absolute inset-0">
              <StageVisual stage={s.id} />
            </div>
          ))}
          <div
            className="absolute -inset-10 rounded-full blur-3xl -z-10"
            style={{ background: 'radial-gradient(circle, rgba(242,192,115,0.14), transparent 70%)' }}
          />
        </div>

        <div className="relative h-44 w-full max-w-xl">
          {STAGES.map((s) => (
            <div key={s.id} className="stage-text absolute inset-0 text-center">
              <h3 className="font-display font-black text-3xl sm:text-5xl text-koala-cream mb-4">{s.title}</h3>
              <p className="text-koala-cream/65 leading-relaxed max-w-md mx-auto text-sm sm:text-base">{s.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
