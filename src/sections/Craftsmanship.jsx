import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { watchState } from '../lib/watchState.js'

gsap.registerPlugin(ScrollTrigger)

const DETAILS = [
  { label: 'The Crown', desc: 'Knurled, screw-down, precision-milled from a single billet of 316L steel.', style: { background: 'radial-gradient(circle at 35% 30%, #eee 0%, #666 35%, #111 75%)' } },
  { label: 'The Dial', desc: 'Sunburst-finished under raking light, guilloché texture cut by hand.', style: { background: 'conic-gradient(from 120deg, #050505, #2a2a2e, #050505 60%, #3a3a3e, #050505)' } },
  { label: 'The Hands', desc: 'Polished sword hands, beveled by hand to a mirror edge.', style: { background: 'linear-gradient(120deg,#fff,#8a8d92 40%,#1a1b1d 70%,#fff)' } },
  { label: 'The Movement', desc: 'Two hundred and eighteen components, assembled under magnification.', style: { background: 'radial-gradient(circle at 60% 40%, #d8b877 0%, #6b4b23 35%, #0d0d0f 80%)' } },
  { label: 'The Crystal', desc: 'Double-domed sapphire, anti-reflective on both faces.', style: { background: 'linear-gradient(135deg, rgba(180,210,255,0.5), rgba(10,10,12,0.9) 60%)' } },
]

export default function Craftsmanship() {
  const ref = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 1 },
      })
      tl.fromTo(watchState.watchPos, { x: 1.3, y: -0.15, z: 0 }, { x: -1.35, y: 0.1, z: -0.4, ease: 'none' }, 0)
      tl.fromTo(watchState, { watchScale: 0.85, watchRotY: 0, watchRotX: 0 }, { watchScale: 0.62, watchRotY: 0.6, watchRotX: -0.1, ease: 'none' }, 0)
      tl.fromTo(watchState.camPos, { x: 0, y: 0, z: 5.4 }, { x: 0, y: 0, z: 5.0, ease: 'none' }, 0)

      cardsRef.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        )
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative min-h-[130vh] w-full py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="eyebrow mb-4">Craftsmanship</p>
        <h2 className="font-display text-4xl md:text-6xl font-light max-w-2xl text-white/90 mb-20">
          Every surface earns its reflection.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DETAILS.map((d, i) => (
            <div
              key={d.label}
              ref={(el) => (cardsRef.current[i] = el)}
              className={`relative overflow-hidden rounded-sm border border-white/10 aspect-[4/5] group ${i === 3 ? 'md:col-span-2' : ''}`}
            >
              <div className="absolute inset-0 tex-noise transition-transform duration-700 group-hover:scale-110" style={d.style} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-display text-2xl mb-1">{d.label}</h3>
                <p className="text-white/55 text-sm max-w-xs leading-relaxed">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
