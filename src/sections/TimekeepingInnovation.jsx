import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { watchState } from '../lib/watchState.js'

gsap.registerPlugin(ScrollTrigger)

const FEATURES = [
  ['01', 'Automatic Winding', 'A rotor harvests energy from the motion of your wrist — 70 hours of reserve, always ready.'],
  ['02', 'Anti-Magnetic Shielding', 'A soft-iron inner cage protects the escapement from fields up to 15,000 gauss.'],
  ['03', 'Precision Regulation', 'Free-sprung balance, adjusted in five positions for accuracy that holds under motion.'],
]

export default function TimekeepingInnovation() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 1 },
      })
      tl.fromTo(watchState.watchPos, { x: 1.2, y: -0.2, z: 0 }, { x: -1.1, y: 0.15, z: 0, ease: 'none' }, 0)
      tl.fromTo(watchState, { watchScale: 0.7, watchRotY: Math.PI + 0.4 }, { watchScale: 0.68, watchRotY: Math.PI + 0.1, ease: 'none' }, 0)
      tl.fromTo(watchState.camPos, { x: 0, y: 0, z: 5.2 }, { x: 0, y: 0, z: 5.0, ease: 'none' }, 0)

      gsap.utils.toArray('.feature-row').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
        )
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative min-h-[110vh] w-full py-32">
      <div className="max-w-5xl mx-auto px-6 md:px-10 md:ml-auto md:mr-24">
        <p className="eyebrow mb-4">Timekeeping Innovation</p>
        <h2 className="font-display text-4xl md:text-6xl font-light mb-20 max-w-xl">
          Accuracy is a discipline.
        </h2>

        <div className="space-y-10">
          {FEATURES.map(([num, title, desc]) => (
            <div key={num} className="feature-row flex gap-8 border-t border-white/10 pt-8">
              <span className="font-display text-3xl text-white/30">{num}</span>
              <div>
                <h3 className="font-display text-2xl mb-2">{title}</h3>
                <p className="text-white/55 text-sm leading-relaxed max-w-md">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
