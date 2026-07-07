import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmoothScroll } from './lib/smoothScroll.js'

import Preloader from './components/Preloader.jsx'
import Navbar from './components/Navbar.jsx'
import Scene3D from './components/Scene3D.jsx'

import Hero from './sections/Hero.jsx'
import Craftsmanship from './sections/Craftsmanship.jsx'
import PrecisionMovement from './sections/PrecisionMovement.jsx'
import MaterialsEngineering from './sections/MaterialsEngineering.jsx'
import TimekeepingInnovation from './sections/TimekeepingInnovation.jsx'
import ColorCollection from './sections/ColorCollection.jsx'
import Testimonials from './sections/Testimonials.jsx'
import CTAFooter from './sections/CTAFooter.jsx'

export default function App() {
  useEffect(() => {
    const lenis = initSmoothScroll()
    const refresh = () => ScrollTrigger.refresh()
    const t = setTimeout(refresh, 300)
    return () => {
      clearTimeout(t)
    }
  }, [])

  return (
    <>
      <Preloader />
      <Navbar />
      <Scene3D />
      <div className="grain-vignette" />

      <main className="relative z-20">
        <Hero />
        <Craftsmanship />
        <PrecisionMovement />
        <MaterialsEngineering />
        <TimekeepingInnovation />
        <div id="collection">
          <ColorCollection />
        </div>
        <Testimonials />
        <CTAFooter />
      </main>
    </>
  )
}
