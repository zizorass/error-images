import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FLAVOURS } from '../data/flavours.js'
import { bus } from '../lib/bus.js'

gsap.registerPlugin(ScrollTrigger)

/* ---------------------------------------------------------- decorations */

function BananaSlice({ className, style }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} aria-hidden="true">
      <circle cx="30" cy="30" r="28" fill="#ffe9a8" stroke="#e8b93f" strokeWidth="3" />
      <circle cx="30" cy="30" r="19" fill="#fff4cd" />
      <g stroke="#e8c86a" strokeWidth="2" opacity="0.8">
        <line x1="30" y1="14" x2="30" y2="46" />
        <line x1="16" y1="22" x2="44" y2="38" />
        <line x1="16" y1="38" x2="44" y2="22" />
      </g>
      <circle cx="30" cy="30" r="3.5" fill="#d9a43a" />
    </svg>
  )
}

function CreamCloud({ className, style }) {
  return (
    <div
      className={`rounded-full bg-koala-milk/25 blur-2xl ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

function Crumb({ className, style }) {
  return <div className={`rounded-[30%] bg-[#a06a2c] ${className}`} style={style} aria-hidden="true" />
}

function SaltCrystal({ className, style }) {
  return (
    <div
      className={`bg-white/85 rotate-45 rounded-[2px] shadow-[0_0_12px_rgba(255,255,255,0.6)] ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

function CaramelBlob({ className, style }) {
  return (
    <div
      className={`blur-3xl ${className}`}
      style={{
        background: 'radial-gradient(circle, rgba(242,160,40,0.5), rgba(190,110,20,0.15) 60%, transparent 75%)',
        borderRadius: '46% 54% 60% 40% / 52% 44% 56% 48%',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

function CoffeeBean({ className, style }) {
  return (
    <svg viewBox="0 0 50 70" className={className} style={style} aria-hidden="true">
      <ellipse cx="25" cy="35" rx="22" ry="32" fill="#4a2c14" />
      <ellipse cx="25" cy="35" rx="22" ry="32" fill="url(#beanshine)" />
      <path d="M25 5 C18 22 32 48 25 65" stroke="#2b1a0e" strokeWidth="5" fill="none" strokeLinecap="round" />
      <defs>
        <linearGradient id="beanshine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(190,130,80,0.55)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.25)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function CoconutFlake({ className, style }) {
  return (
    <svg viewBox="0 0 40 16" className={className} style={style} aria-hidden="true">
      <path d="M2 12 Q20 -6 38 10 Q20 16 2 12 Z" fill="#f7f0e2" opacity="0.92" />
    </svg>
  )
}

function Steam({ className, style }) {
  return (
    <div
      className={`w-10 rounded-full blur-lg ${className}`}
      style={{
        background: 'linear-gradient(to top, transparent, rgba(244,231,208,0.22), transparent)',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

function Wave({ className, style }) {
  return (
    <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className={className} style={style} aria-hidden="true">
      <path
        d="M0 70 C240 10 480 130 720 70 C960 10 1200 130 1440 70 L1440 140 L0 140 Z"
        fill="url(#wavegrad)"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="wavegrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd8d0" />
          <stop offset="1" stopColor="#0e4a44" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function Mist({ className, style }) {
  return (
    <div
      className={`rounded-full blur-3xl bg-koala-sea/15 ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

// data-depth drives both the scroll parallax and the pointer parallax
const DECOR = {
  banoffee: (
    <>
      <BananaSlice className="decor absolute w-16 sm:w-24 left-[8%] top-[18%] animate-float-slow" data-depth="0.55" />
      <BananaSlice className="decor absolute w-10 sm:w-16 left-[26%] top-[64%] animate-float-slower" data-depth="0.85" />
      <BananaSlice className="decor absolute w-12 sm:w-20 right-[10%] top-[26%] animate-float-slower" data-depth="0.4" />
      <CreamCloud className="decor absolute w-64 h-40 left-[4%] top-[46%]" data-depth="0.25" />
      <CreamCloud className="decor absolute w-80 h-48 right-[2%] bottom-[10%]" data-depth="0.35" />
      <Crumb className="decor absolute w-2.5 h-2 left-[38%] top-[30%] animate-float-slow" data-depth="1" />
      <Crumb className="decor absolute w-2 h-2 left-[16%] top-[78%] animate-float-slower" data-depth="1.2" />
      <Crumb className="decor absolute w-3 h-2.5 right-[30%] top-[70%] animate-float-slow" data-depth="0.9" />
      <Crumb className="decor absolute w-1.5 h-1.5 right-[22%] top-[14%] animate-float-slower" data-depth="1.4" />
      <svg className="decor absolute left-[12%] bottom-[18%] w-40 opacity-70" viewBox="0 0 200 60" data-depth="0.6" aria-hidden="true">
        <path d="M4 30 Q54 4 100 30 T196 30" stroke="url(#drizzle)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <defs><linearGradient id="drizzle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f2c073" /><stop offset="1" stopColor="#c97b1e" /></linearGradient></defs>
      </svg>
    </>
  ),
  salted: (
    <>
      <CaramelBlob className="decor absolute w-[26rem] h-[22rem] -left-24 top-[24%]" data-depth="0.2" />
      <CaramelBlob className="decor absolute w-80 h-72 right-[-4rem] bottom-[6%]" data-depth="0.35" />
      <SaltCrystal className="decor absolute w-2.5 h-2.5 left-[20%] top-[22%] animate-float-slower" data-depth="1.1" />
      <SaltCrystal className="decor absolute w-1.5 h-1.5 left-[34%] top-[58%] animate-float-slow" data-depth="1.5" />
      <SaltCrystal className="decor absolute w-3 h-3 right-[26%] top-[34%] animate-float-slower" data-depth="0.8" />
      <SaltCrystal className="decor absolute w-2 h-2 right-[14%] top-[68%] animate-float-slow" data-depth="1.3" />
      <SaltCrystal className="decor absolute w-1.5 h-1.5 left-[12%] bottom-[16%] animate-float-slower" data-depth="1.6" />
      <SaltCrystal className="decor absolute w-2 h-2 right-[38%] top-[12%] animate-float-slow" data-depth="1" />
    </>
  ),
  mocha: (
    <>
      <CoffeeBean className="decor absolute w-10 sm:w-14 left-[12%] top-[20%] animate-float-slow" data-depth="0.6" style={{ rotate: '18deg' }} />
      <CoffeeBean className="decor absolute w-8 sm:w-11 right-[16%] top-[58%] animate-float-slower" data-depth="0.9" style={{ rotate: '-24deg' }} />
      <CoffeeBean className="decor absolute w-6 sm:w-9 left-[30%] bottom-[14%] animate-float-slow" data-depth="1.1" style={{ rotate: '65deg' }} />
      <CoconutFlake className="decor absolute w-8 left-[22%] top-[44%] animate-float-slower" data-depth="1.3" />
      <CoconutFlake className="decor absolute w-6 right-[28%] top-[24%] animate-float-slow" data-depth="1.5" style={{ rotate: '-15deg' }} />
      <CoconutFlake className="decor absolute w-10 right-[8%] bottom-[20%] animate-float-slower" data-depth="0.8" style={{ rotate: '30deg' }} />
      <Steam className="decor absolute h-40 left-[16%] bottom-[8%]" data-depth="0.5" />
      <Steam className="decor absolute h-56 left-[46%] bottom-[4%]" data-depth="0.4" style={{ animationDelay: '1s' }} />
      <Steam className="decor absolute h-44 right-[20%] bottom-[10%]" data-depth="0.6" />
    </>
  ),
  seasalt: (
    <>
      <Wave className="decor absolute inset-x-0 bottom-0 h-36 w-full" data-depth="0.3" />
      <Wave className="decor absolute inset-x-0 bottom-6 h-28 w-full opacity-60" data-depth="0.5" style={{ transform: 'scaleX(-1)' }} />
      <Mist className="decor absolute w-96 h-56 left-[6%] top-[18%]" data-depth="0.25" />
      <Mist className="decor absolute w-72 h-44 right-[4%] top-[48%]" data-depth="0.4" />
      <SaltCrystal className="decor absolute w-2 h-2 left-[24%] top-[30%] animate-float-slow" data-depth="1.2" />
      <SaltCrystal className="decor absolute w-1.5 h-1.5 right-[30%] top-[20%] animate-float-slower" data-depth="1.5" />
      <SaltCrystal className="decor absolute w-2.5 h-2.5 right-[18%] top-[62%] animate-float-slow" data-depth="0.9" />
      <div className="decor absolute w-2 h-2 rounded-full bg-koala-sea/60 left-[14%] top-[56%] animate-float-slower" data-depth="1.4" />
      <div className="decor absolute w-1.5 h-1.5 rounded-full bg-koala-sea/50 left-[40%] top-[74%] animate-float-slow" data-depth="1.7" />
    </>
  ),
}

/* ---------------------------------------------------------- scene */

function FlavourScene({ flavour, index }) {
  const ref = useRef(null)
  const contentRight = index % 2 === 0

  useEffect(() => {
    const el = ref.current
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.reveal'),
        { y: 70, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 62%' },
        }
      )

      // Decor drifts at its own depth as the scene scrolls through
      el.querySelectorAll('.decor').forEach((d) => {
        const depth = parseFloat(d.dataset.depth || '1')
        gsap.fromTo(
          d,
          { yPercent: 26 * depth, opacity: 0 },
          {
            yPercent: -26 * depth, opacity: 1, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
          }
        )
      })

      gsap.fromTo(
        el.querySelector('.big-number'),
        { scale: 1.4, opacity: 0 },
        {
          scale: 1, opacity: 0.1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 90%', end: 'center center', scrub: 1 },
        }
      )
    }, el)

    // Pointer parallax on the decorations
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      el.querySelectorAll('.decor').forEach((d) => {
        const depth = parseFloat(d.dataset.depth || '1')
        d.style.translate = `${-x * 26 * depth}px ${-y * 18 * depth}px`
      })
    }
    const fine = window.matchMedia('(pointer: fine)').matches
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      ctx.revert()
      if (fine) window.removeEventListener('pointermove', onMove)
    }
  }, [flavour])

  const { palette } = flavour

  return (
    <section
      ref={ref}
      id={index === 0 ? 'flavours' : undefined}
      data-theme={flavour.theme}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Atmosphere wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(60% 70% at ${contentRight ? '72%' : '28%'} 50%, ${palette.glow}, transparent 70%)`,
        }}
      />

      {/* Giant ghost number */}
      <span
        className="big-number absolute font-display font-black text-[38vw] leading-none text-stroke select-none pointer-events-none"
        style={{ [contentRight ? 'left' : 'right']: '2%', top: '6%' }}
        aria-hidden="true"
      >
        {flavour.number}
      </span>

      {DECOR[flavour.id]}

      <div
        className={`relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 grid md:grid-cols-2 gap-10 items-center ${
          contentRight ? '' : ''
        }`}
      >
        {/* Empty half leaves room for the 3D bucket to drift in */}
        {contentRight && <div className="hidden md:block" />}

        <div className="relative" style={{ textShadow: '0 2px 26px rgba(18,12,6,0.65)' }}>
          <div
            className="absolute -inset-10 rounded-[3rem] blur-2xl -z-10"
            style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(18,12,6,0.5), transparent 75%)' }}
            aria-hidden="true"
          />
          <p className="reveal text-xs tracking-widest2 uppercase mb-4 opacity-0" style={{ color: palette.accent }}>
            Flavour {flavour.number} — {flavour.tagline}
          </p>
          <h2 className="reveal font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6 opacity-0" style={{ color: palette.text }}>
            {flavour.name.split(' ').map((w) => (
              <span key={w} className="block">{w}</span>
            ))}
          </h2>
          <p className="reveal text-koala-cream/70 text-base sm:text-lg leading-relaxed max-w-md mb-8 opacity-0">
            {flavour.description}
          </p>
          <div className="reveal flex flex-wrap gap-2.5 opacity-0">
            {flavour.notes.map((note) => (
              <span
                key={note}
                className="glass rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-koala-cream/85 hover:scale-105 hover:border-koala-gold/40 transition-all cursor-default"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {!contentRight && <div className="hidden md:block" />}
      </div>
    </section>
  )
}

export default function FlavourScenes() {
  return (
    <div>
      {FLAVOURS.map((f, i) => (
        <FlavourScene key={f.id} flavour={f} index={i} />
      ))}
    </div>
  )
}
