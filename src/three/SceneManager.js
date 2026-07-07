import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createWatch } from './createWatch.js'
import { createMovement } from './createMovement.js'
import { createParticles } from './createParticles.js'
import { VARIANTS } from '../lib/variants.js'

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas
    this.clock = new THREE.Clock()

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15
    this.renderer.setClearColor(0x000000, 0)

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    this.camera.position.set(0, 0, 6)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    this.key = new THREE.DirectionalLight(0xffffff, 2.2)
    this.key.position.set(3, 4, 5)
    this.scene.add(this.key)

    this.rim = new THREE.DirectionalLight(0x8fb4ff, 1.4)
    this.rim.position.set(-4, -2, -3)
    this.scene.add(this.rim)

    this.cursorLight = new THREE.PointLight(0xffffff, 3, 12, 2)
    this.cursorLight.position.set(0, 0, 3)
    this.scene.add(this.cursorLight)

    this.ambient = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(this.ambient)

    this.watch = createWatch()
    this.scene.add(this.watch.group)

    this.movement = createMovement(this.watch.parts.movementGroup)

    this.particles = createParticles()
    this.scene.add(this.particles.group)

    this.mouseSmoothed = { x: 0, y: 0 }

    this.resize = this.resize.bind(this)
    window.addEventListener('resize', this.resize)
    this.resize()
  }

  resize() {
    const { clientWidth, clientHeight } = this.canvas.parentElement
    const w = clientWidth || window.innerWidth
    const h = clientHeight || window.innerHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  // `state` is a plain object written by Scene3D.jsx each frame, combining
  // the mutable experience store with any GSAP-driven values.
  render(state) {
    const t = this.clock.getElapsedTime()

    this.mouseSmoothed.x += (state.mouse.x - this.mouseSmoothed.x) * 0.06
    this.mouseSmoothed.y += (state.mouse.y - this.mouseSmoothed.y) * 0.06

    const watchGroup = this.watch.group
    watchGroup.position.set(state.watchPos.x, state.watchPos.y, state.watchPos.z)
    watchGroup.rotation.y = state.watchRotY + this.mouseSmoothed.x * 0.35
    watchGroup.rotation.x = state.watchRotX + this.mouseSmoothed.y * -0.2
    watchGroup.scale.setScalar(state.watchScale)
    watchGroup.visible = state.watchVisible

    this.watch.setOpen(state.openFactor)
    this.watch.setVariant(state.variantA, state.variantB, state.variantT)

    this.movement.update(state.explodeFactor, t)

    this.camera.position.set(
      state.camPos.x + this.mouseSmoothed.x * 0.25,
      state.camPos.y + this.mouseSmoothed.y * 0.15,
      state.camPos.z
    )
    this.camera.lookAt(state.camLookAt.x, state.camLookAt.y, state.camLookAt.z)

    this.cursorLight.position.set(this.mouseSmoothed.x * 3.5, this.mouseSmoothed.y * 2.2, 3.2)
    this.cursorLight.color.set(state.lightColor)
    this.rim.color.set(state.lightColor)

    this.particles.update(t, this.mouseSmoothed)
    this.particles.group.visible = state.particlesVisible

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    window.removeEventListener('resize', this.resize)
    this.renderer.dispose()
  }
}

export const VARIANT_COUNT = VARIANTS.length
