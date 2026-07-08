import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FLAVOURS } from '../data/flavours.js'
import { bus } from '../lib/bus.js'
import { pop, chime, unlockAudio } from '../lib/audio.js'
import TiltCard from '../components/TiltCard.jsx'
import PacketVisual from '../components/PacketVisual.jsx'

gsap.registerPlugin(ScrollTrigger)

// Popcorn confetti burst at the click point
function confettiBurst(x, y) {
  for (let i = 0; i < 16; i++) {
    const bit = document.createElement('div')
    const size = 6 + Math.random() * 8
    bit.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;z-index:80;pointer-events:none;border-radius:40% 60% 55% 45%;background:${Math.random() > 0.5 ? '#f2c073' : '#f6ecd8'};box-shadow:0 0 6px rgba(242,192,115,0.5)`
    document.body.appendChild(bit)
    const angle = Math.random() * Math.PI * 2
    const dist = 60 + Math.random() * 110
    bit.animate(
      [
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 70}px) scale(0.3) rotate(${Math.random() * 540 - 270}deg)`,
          opacity: 0,
        },
      ],
      { duration: 700 + Math.random() * 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    ).onfinish = () => bit.remove()
  }
}

// Clone of the packet flies into the cart icon
function flyToCart(packetEl) {
  const cart = document.getElementById('cart-button')
  if (!cart || !packetEl) return
  const from = packetEl.getBoundingClientRect()
  const to = cart.getBoundingClientRect()
  const clone = packetEl.cloneNode(true)
  clone.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;z-index:79;pointer-events:none;margin:0`
  document.body.appendChild(clone)
  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  clone.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 120}px) scale(0.5) rotate(12deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08) rotate(24deg)`, opacity: 0.4 },
    ],
    { duration: 750, easing: 'cubic-bezier(0.5, 0, 0.2, 1)' }
  ).onfinish = () => clone.remove()
}

function ProductCard({ flavour, onAdd }) {
  const packetRef = useRef(null)

  const handleAdd = (e) => {
    unlockAudio()
    pop(1 + Math.random() * 0.4)
    setTimeout(() => chime(), 240)
    confettiBurst(e.clientX, e.clientY)
    flyToCart(packetRef.current)
    bus.emit('cart:add', { id: flavour.id })
    onAdd(flavour.id)
  }

  const { palette } = flavour
  return (
    <TiltCard className="product-card group rounded-[2rem] opacity-0">
      <div
        className="glass rounded-[2rem] p-6 sm:p-8 h-full flex flex-col items-center text-center relative overflow-hidden transition-shadow duration-500 group-hover:shadow-caramel-lg"
        style={{ '--glow': palette.glow }}
      >
        {/* hover glow + floating particles */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: `radial-gradient(70% 60% at 50% 30%, ${palette.glow}, transparent 70%)` }}
        />
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              left: `${14 + i * 14}%`,
              bottom: '8%',
              background: palette.accent,
              animation: `drift-up ${2.4 + i * 0.5}s ease-in-out ${i * 0.35}s infinite`,
            }}
          />
        ))}

        <div
          ref={packetRef}
          className="relative w-36 sm:w-44 mb-6 transition-transform duration-500 ease-out group-hover:-translate-y-3 group-hover:rotate-2 group-hover:scale-105"
          style={{ filter: `drop-shadow(0 24px 30px rgba(0,0,0,0.45)) drop-shadow(0 6px 24px ${palette.glow})` }}
        >
          <PacketVisual flavour={flavour} className="w-full h-auto" />
        </div>

        <h3 className="font-display font-bold text-2xl text-koala-cream mb-1">{flavour.name}</h3>
        <p className="text-sm text-koala-cream/55 mb-5 max-w-[24ch]">{flavour.tagline}</p>

        <div className="mt-auto w-full flex items-center justify-between gap-3">
          <span className="font-display font-bold text-xl" style={{ color: palette.accent }}>
            £{flavour.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className="btn-caramel rounded-full px-6 py-3 text-sm font-bold text-koala-night"
          >
            Add to bag
          </button>
        </div>
      </div>
    </TiltCard>
  )
}

export default function Products({ onAdd }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.shop-head',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 65%' } }
      )
      gsap.fromTo(
        '.product-card',
        { y: 90, opacity: 0, rotateX: 8 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 55%' } }
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="shop" data-theme="products" className="relative py-28 sm:py-36 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="shop-head text-koala-gold tracking-widest2 uppercase text-xs mb-4 text-center opacity-0">
          The collection
        </p>
        <h2 className="shop-head font-display font-black text-5xl sm:text-7xl text-center text-koala-cream mb-4 opacity-0">
          Pick your <span className="text-gradient-caramel italic">poison.</span>
        </h2>
        <p className="shop-head text-center text-koala-cream/60 max-w-lg mx-auto mb-16 opacity-0">
          Four flavours. All caramel. All dangerous. Sold in 150g packets of pure cinema.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ perspective: '1200px' }}>
          {FLAVOURS.map((f) => (
            <ProductCard key={f.id} flavour={f} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  )
}
