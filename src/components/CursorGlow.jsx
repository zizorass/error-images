import { useEffect, useRef } from 'react'

// A soft caramel light that follows the cursor — the background "reacts" to
// movement. Desktop pointers only.
export default function CursorGlow() {
  const ref = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    let x = innerWidth / 2
    let y = innerHeight / 2
    let tx = x
    let ty = y
    let raf
    const move = (e) => {
      tx = e.clientX
      ty = e.clientY
    }
    const loop = () => {
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      el.style.transform = `translate(${x - 250}px, ${y - 250}px)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-[5] hidden md:block"
      style={{
        background:
          'radial-gradient(circle, rgba(242,192,115,0.07) 0%, rgba(242,192,115,0.03) 40%, transparent 70%)',
      }}
    />
  )
}
