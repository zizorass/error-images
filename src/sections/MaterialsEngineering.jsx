import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { watchState } from '../lib/watchState.js'
import TiltCard from '../components/TiltCard.jsx'

gsap.registerPlugin(ScrollTrigger)

const MATERIALS = [
  { name: 'Grade 5 Titanium', desc: 'Aerospace alloy, 40% lighter than steel, twice as strong.' },
  { name: 'Sapphire Crystal', desc: 'Second only to diamond in hardness. Scratch-proof for life.' },
  { name: 'Ceramic Bezel', desc: 'Fired at 1,450°C — impervious to fading or corrosion.' },
  { name: 'COSC Movement', desc: 'Chronometer-certified to -4/+6 seconds a day.' },
]

export default function MaterialsEngineering() {
  const ref = useRef(null)
  const bgRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 1 },
      })
      tl.fromTo(watchState.watchPos, { x: -0.9, y: 0, z: 0 }, { x: 1.2, y: -0.2, z: 0, ease: 'none' }, 0)
      tl.fromTo(watchState, { watchScale: 0.9, watchRotY: Math.PI }, { watchScale: 0.7, watchRotY: Math.PI + 0.4, ease: 'none' }, 0)
      tl.fromTo(watchState.camPos, { x: 0, y: 0, z: 5.6 }, { x: 0, y: 0, z: 5.2, ease: 'none' }, 0)

      gsap.to(bgRef.current, {
        backgroundPosition: '100% 50%',
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      gsap.utils.toArray('.material-card').forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.9, delay: i * 0.05, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }
        )
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative min-h-[120vh] w-full py-32 overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'linear-gradient(120deg, #05060a 0%, #14161c 25%, #383c46 50%, #14161c 75%, #05060a 100%)',
          backgroundSize: '250% 100%',
          backgroundPosition: '0% 50%',
        }}
      />
      <div className="absolute inset-0 tex-noise" />

      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-10">
        <p className="eyebrow mb-4">Materials &amp; Engineering</p>
        <h2 className="font-display text-4xl md:text-6xl font-light max-w-2xl mb-20">
          Built from what survives.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MATERIALS.map((m) => (
            <TiltCard key={m.name} className="material-card rounded-sm border border-white/10 tex-brushed-metal p-8">
              <h3 className="font-display text-2xl mb-2">{m.name}</h3>
              <p className="text-white/55 text-sm leading-relaxed max-w-sm">{m.desc}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
