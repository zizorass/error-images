import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { watchState } from '../lib/watchState.js'
import { VARIANTS, lerpHex } from '../lib/variants.js'

gsap.registerPlugin(ScrollTrigger)

const TURNS = VARIANTS.length - 1 // one full rotation per finish transition

export default function ColorCollection() {
  const ref = useRef(null)
  const bgRef = useRef(null)
  const nameRef = useRef(null)
  const taglineRef = useRef(null)
  const dotsRef = useRef([])
  const lastIndex = useRef(-1)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: '+=500%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = Math.max(0, (self.progress - 0.05) / 0.95)
            const turns = clamp01(progress) * TURNS
            const stopIndex = Math.min(TURNS - 1, Math.floor(turns))
            const t = turns - stopIndex
            const a = VARIANTS[Math.max(0, stopIndex)]
            const b = VARIANTS[Math.min(VARIANTS.length - 1, Math.max(0, stopIndex) + 1)]
            if (bgRef.current) {
              const c1 = lerpHex(a.bg[0], b.bg[0], t)
              const c2 = lerpHex(a.bg[1], b.bg[1], t)
              bgRef.current.style.background = `radial-gradient(circle at 50% 45%, transparent 0%, transparent 22%, ${c2} 50%, ${c1} 85%)`
            }
            const roundedIndex = t > 0.5 ? Math.min(VARIANTS.length - 1, stopIndex + 1) : stopIndex
            if (roundedIndex !== lastIndex.current && progress > 0) {
              lastIndex.current = roundedIndex
              const v = VARIANTS[roundedIndex]
              if (nameRef.current) {
                gsap.fromTo(nameRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 })
                nameRef.current.textContent = v.name
              }
              if (taglineRef.current) {
                taglineRef.current.textContent = v.tagline
              }
              dotsRef.current.forEach((d, i) => {
                if (!d) return
                d.style.opacity = i === roundedIndex ? '1' : '0.3'
                d.style.transform = i === roundedIndex ? 'scale(1.4)' : 'scale(1)'
              })
            }
          },
        },
      })

      tl.fromTo(watchState.watchPos, { x: -1.1, y: 0.15, z: 0 }, { x: 0, y: 0, z: 0, duration: 0.05 }, 0)
      tl.fromTo(watchState, { watchScale: 0.68, watchRotX: 0 }, { watchScale: 1.05, watchRotX: 0, duration: 0.05 }, 0)
      tl.fromTo(watchState.camPos, { x: 0, y: 0, z: 5.0 }, { x: 0, y: 0, z: 5.5, duration: 0.05 }, 0)

      tl.fromTo(watchState, { collectionSpin: 0 }, { collectionSpin: Math.PI * 2 * TURNS, duration: 0.95, ease: 'none' }, 0.05)
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 transition-none"
        style={{ background: `radial-gradient(circle at 50% 45%, transparent 0%, transparent 22%, ${VARIANTS[0].bg[1]} 50%, ${VARIANTS[0].bg[0]} 85%)` }}
      />
      <div className="absolute inset-0 tex-noise" />

      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col justify-between py-16">
        <div>
          <p className="eyebrow mb-2">The Color Collection</p>
          <h2 className="font-display text-3xl md:text-5xl font-light max-w-xl">
            One design. Five ways to forge it.
          </h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p ref={nameRef} className="font-display text-4xl md:text-6xl mb-2">
              {VARIANTS[0].name}
            </p>
            <p ref={taglineRef} className="text-white/55 max-w-sm">
              {VARIANTS[0].tagline}
            </p>
          </div>
          <div className="flex gap-3">
            {VARIANTS.map((v, i) => (
              <span
                key={v.id}
                ref={(el) => (dotsRef.current[i] = el)}
                className="w-2.5 h-2.5 rounded-full transition-transform duration-300"
                style={{ background: v.accent, opacity: i === 0 ? 1 : 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}
