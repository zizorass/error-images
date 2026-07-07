import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { watchState } from '../lib/watchState.js'

gsap.registerPlugin(ScrollTrigger)

export default function PrecisionMovement() {
  const ref = useRef(null)
  const capOpen = useRef(null)
  const capExplode = useRef(null)
  const capReassemble = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: '+=350%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })

      // intro — watch returns to center stage
      tl.fromTo(watchState.watchPos, { x: -1.35, y: 0.1, z: -0.4 }, { x: 0, y: 0, z: 0, duration: 0.12 }, 0)
      tl.fromTo(watchState, { watchScale: 0.62, watchRotY: 0.6, watchRotX: -0.1 }, { watchScale: 1.15, watchRotY: 0, watchRotX: 0, duration: 0.12 }, 0)
      tl.fromTo(watchState.camPos, { x: 0, y: 0, z: 5.0 }, { x: 0, y: 0, z: 6.2, duration: 0.12 }, 0)

      // case opens
      tl.fromTo(watchState, { openFactor: 0 }, { openFactor: 1, duration: 0.2 }, 0.12)
      tl.fromTo(capOpen.current, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.14)
      tl.to(capOpen.current, { opacity: 0, duration: 0.05 }, 0.28)

      // components explode outward, camera dollies in
      tl.fromTo(watchState, { explodeFactor: 0 }, { explodeFactor: 1, duration: 0.23 }, 0.32)
      tl.fromTo(watchState.camPos, { z: 6.2 }, { z: 2.3, duration: 0.23 }, 0.32)
      tl.fromTo(capExplode.current, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.36)

      // camera flies through the field of components
      tl.fromTo(watchState, { watchRotY: 0 }, { watchRotY: Math.PI, duration: 0.13 }, 0.55)
      tl.fromTo(watchState.camLookAt, { x: 0 }, { x: 0.2, duration: 0.07 }, 0.55)
      tl.to(watchState.camLookAt, { x: 0, duration: 0.06 }, 0.62)
      tl.to(capExplode.current, { opacity: 0, duration: 0.05 }, 0.63)

      // reassembly
      tl.fromTo(watchState, { explodeFactor: 1 }, { explodeFactor: 0, duration: 0.22 }, 0.68)
      tl.fromTo(watchState.camPos, { z: 2.3 }, { z: 6.2, duration: 0.22 }, 0.68)
      tl.fromTo(capReassemble.current, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.72)
      tl.to(capReassemble.current, { opacity: 0, duration: 0.05 }, 0.87)

      // case closes, hand off to next section
      tl.fromTo(watchState, { openFactor: 1 }, { openFactor: 0, duration: 0.1 }, 0.9)
      tl.fromTo(watchState, { watchScale: 1.15 }, { watchScale: 0.9, duration: 0.1 }, 0.9)
      tl.fromTo(watchState.watchPos, { x: 0, y: 0, z: 0 }, { x: -0.9, y: 0, z: 0, duration: 0.1 }, 0.9)
      tl.fromTo(watchState.camPos, { z: 6.2 }, { z: 5.6, duration: 0.1 }, 0.9)
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(40,45,55,0.55),rgba(0,0,0,0.85)_75%)]" />
      <div className="relative z-20 h-full max-w-5xl mx-auto px-6 flex items-center justify-center text-center">
        <div className="relative w-full">
          <p ref={capOpen} className="absolute inset-x-0 -top-10 md:top-0 opacity-0 font-display text-2xl md:text-4xl text-white/85">
            The case opens.
          </p>
          <p ref={capExplode} className="absolute inset-x-0 -top-10 md:top-0 opacity-0 font-display text-2xl md:text-4xl text-white/85">
            Two hundred and eighteen components, in motion.
          </p>
          <p ref={capReassemble} className="absolute inset-x-0 -top-10 md:top-0 opacity-0 font-display text-2xl md:text-4xl text-white/85">
            Reassembled to zero tolerance.
          </p>
        </div>
      </div>
      <div className="absolute top-10 left-6 md:left-10 z-20">
        <p className="eyebrow">The Movement</p>
      </div>
    </section>
  )
}
