import { useCallback, useEffect, useRef, useState } from 'react'
import { Experience } from './three/Experience.js'
import { initSmoothScroll } from './lib/smoothScroll.js'
import { bus } from './lib/bus.js'
import { unlockAudio } from './lib/audio.js'
import Intro from './components/Intro.jsx'
import Navbar from './components/Navbar.jsx'
import CursorGlow from './components/CursorGlow.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Hero from './sections/Hero.jsx'
import FlavourScenes from './sections/FlavourScenes.jsx'
import Products from './sections/Products.jsx'
import About from './sections/About.jsx'
import Footer from './sections/Footer.jsx'

export default function App() {
  const canvasRef = useRef(null)
  const [started, setStarted] = useState(false)
  const [cart, setCart] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = initSmoothScroll()
    lenis.stop()
    window.scrollTo(0, 0)

    const experience = new Experience(canvasRef.current, { reducedMotion })

    const offTheme = bus.on('theme', (name) => experience.setTheme(name))
    const offSkip = bus.on('intro:skip', () => experience.skipIntro())
    const offDone = bus.on('intro:done', () => lenis.start())
    const onScroll = ({ progress }) => experience.setScroll(progress || 0)
    lenis.on('scroll', onScroll)

    // The active theme is whichever data-theme section spans the viewport
    // midline — checked every frame, so it works for smooth scroll, instant
    // jumps and anchor links alike.
    const themed = Array.from(document.querySelectorAll('[data-theme]'))
    let lastTheme = null
    const scanTheme = () => {
      const mid = window.innerHeight * 0.55
      let active = null
      for (const el of themed) {
        const r = el.getBoundingClientRect()
        if (r.top <= mid && r.bottom >= mid) {
          active = el.dataset.theme
          break
        }
      }
      // In gaps (e.g. pin spacers) keep the current theme; only default to
      // hero near the top of the page.
      if (!active) {
        if (window.scrollY < window.innerHeight * 0.6) active = 'hero'
        else return
      }
      if (active !== lastTheme) {
        lastTheme = active
        bus.emit('theme', active)
      }
    }
    const ticker = setInterval(scanTheme, 180)

    // First user gesture unlocks WebAudio so the boom can actually boom
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    experience.playIntro()

    return () => {
      offTheme()
      offSkip()
      offDone()
      lenis.off('scroll', onScroll)
      clearInterval(ticker)
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      experience.dispose()
    }
  }, [])

  const addToCart = useCallback((id) => setCart((c) => [...c, id]), [])
  const removeFromCart = useCallback(
    (id) => setCart((c) => c.filter((item) => item !== id)),
    []
  )

  return (
    <div className="grain relative">
      {/* the whole 3D world lives on this one canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" aria-hidden="true" />

      <CursorGlow />
      <Intro onDone={() => setStarted(true)} />

      {started && <Navbar cartCount={cart.length} onCartOpen={() => setDrawerOpen(true)} />}

      <main className={started ? '' : 'invisible'}>
        <div id="hero-anchor">
          <Hero started={started} />
        </div>
        <FlavourScenes />
        <Products onAdd={addToCart} />
        <About />
        <Footer />
      </main>

      <CartDrawer
        open={drawerOpen}
        items={cart}
        onClose={() => setDrawerOpen(false)}
        onRemove={removeFromCart}
      />
    </div>
  )
}
