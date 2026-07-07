import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SceneManager } from '../three/SceneManager.js'
import { watchState } from '../lib/watchState.js'
import { experience, setMouse } from '../lib/experience.js'
import { VARIANTS, lerpHex } from '../lib/variants.js'

export default function Scene3D() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const manager = new SceneManager(canvasRef.current)
    let raf = 0

    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      setMouse(nx, -ny)
    }
    window.addEventListener('pointermove', onMove)

    const tick = () => {
      experience.mouse.x += (experience.mouse.targetX - experience.mouse.x) * 0.08
      experience.mouse.y += (experience.mouse.targetY - experience.mouse.y) * 0.08

      const t = manager.clock.getElapsedTime()
      const idleSpin = t * 0.12

      const turns = watchState.collectionSpin / (Math.PI * 2)
      const stopIndex = THREE.MathUtils.clamp(Math.floor(turns), 0, VARIANTS.length - 2)
      const variantA = stopIndex
      const variantB = Math.min(VARIANTS.length - 1, stopIndex + 1)
      const variantT = THREE.MathUtils.clamp(turns - stopIndex, 0, 1)
      const lightColor = lerpHex(VARIANTS[variantA].light, VARIANTS[variantB].light, variantT)

      manager.render({
        mouse: experience.mouse,
        watchPos: watchState.watchPos,
        watchRotY: watchState.watchRotY + watchState.collectionSpin + idleSpin,
        watchRotX: watchState.watchRotX,
        watchScale: watchState.watchScale,
        watchVisible: true,
        openFactor: watchState.openFactor,
        explodeFactor: watchState.explodeFactor,
        variantA,
        variantB,
        variantT,
        camPos: watchState.camPos,
        camLookAt: watchState.camLookAt,
        lightColor,
        particlesVisible: true,
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      manager.dispose()
    }
  }, [])

  return (
    <div ref={wrapRef} className="fixed inset-0 z-10 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
