import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { watchState } from '../lib/watchState.js'
import TiltCard from '../components/TiltCard.jsx'

gsap.registerPlugin(ScrollTrigger)

const QUOTES = [
  { quote: 'The most precise piece I have ever worn. The movement reveal at the boutique sold me before I even tried it on.', name: 'A. Kessler', role: 'Collector, Zürich' },
  { quote: 'Five finishes, one obsession with detail. The Rose Gold catches light like nothing else in my collection.', name: 'M. Sato', role: 'Collector, Tokyo' },
  { quote: 'CHROME does not chase trends. It chases tolerances. That is rarer.', name: 'L. Duval', role: 'Horology Journalist' },
]

export default function Testimonials() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 1 },
      })
      tl.fromTo(watchState.watchPos, { x: 0, y: 0, z: 0 }, { x: 1.5, y: -0.3, z: -0.5, ease: 'none' }, 0)
      tl.fromTo(watchState, { watchScale: 1.05 }, { watchScale: 0.45, ease: 'none' }, 0)
      tl.fromTo(watchState.camPos, { x: 0, y: 0, z: 5.5 }, { x: 0, y: 0, z: 6.5, ease: 'none' }, 0)

      gsap.utils.toArray('.quote-card').forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }
        )
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative min-h-[110vh] w-full py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <p className="eyebrow mb-4">Testimonials</p>
        <h2 className="font-display text-4xl md:text-6xl font-light max-w-2xl mb-20">
          Worn by those who notice details.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUOTES.map((q) => (
            <TiltCard key={q.name} className="quote-card rounded-sm border border-white/10 p-8 bg-white/[0.02] backdrop-blur-sm">
              <p className="font-display text-xl leading-relaxed mb-8 text-white/85">&ldquo;{q.quote}&rdquo;</p>
              <p className="text-sm text-white/50">{q.name}</p>
              <p className="text-xs text-white/30 uppercase tracking-widest2">{q.role}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
