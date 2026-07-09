import * as THREE from 'three'
import gsap from 'gsap'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import {
  createPopcornGeometry,
  createBucketTexture,
  createCaramelTextures,
  createStudioEnvironment,
} from './popcorn.js'
import { bus } from '../lib/bus.js'

const THEMES = {
  hero:     { key: '#ffd9a0', rim: '#ff9d3c', fog: '#171006', keyIntensity: 1.6, bucket: [0, -1.35, -0.5], scale: 0.9,  camDist: 4.6, camHeight: 0.35, bloom: 0.35 },
  banoffee: { key: '#ffd873', rim: '#ffb84d', fog: '#221605', keyIntensity: 1.7, bucket: [-1.7, -0.55, -0.6], scale: 0.8, camDist: 5.0, camHeight: 0.4,  bloom: 0.38 },
  salted:   { key: '#f2c073', rim: '#ff8c1a', fog: '#1c1206', keyIntensity: 2.0, bucket: [1.7, -0.55, -0.6],  scale: 0.8, camDist: 4.8, camHeight: 0.2,  bloom: 0.45 },
  mocha:    { key: '#b97e4e', rim: '#4a2e18', fog: '#100a05', keyIntensity: 1.2, bucket: [-1.7, -0.55, -0.6], scale: 0.8, camDist: 5.0, camHeight: 0.5,  bloom: 0.35 },
  seasalt:  { key: '#a9e8e0', rim: '#f2c073', fog: '#0d1a17', keyIntensity: 1.5, bucket: [1.7, -0.55, -0.6],  scale: 0.8, camDist: 4.8, camHeight: 0.15, bloom: 0.4 },
  products: { key: '#ffe2b8', rim: '#e0a04a', fog: '#171006', keyIntensity: 1.5, bucket: [0, -1.0, -3.4],   scale: 0.6,  camDist: 5.6, camHeight: 0.3,  bloom: 0.32 },
  about:    { key: '#e0a04a', rim: '#7a4a12', fog: '#150e05', keyIntensity: 1.3, bucket: [2.5, -0.45, -2.0], scale: 0.68, camDist: 5.2, camHeight: 0.45, bloom: 0.35 },
  footer:   { key: '#ffcf7d', rim: '#ff9d3c', fog: '#1a1006', keyIntensity: 1.9, bucket: [0, -2.35, -2.6], scale: 0.55, camDist: 4.6, camHeight: 0.3, bloom: 0.55 },
}

// Per-instance tints multiply the baked caramel vertex colors, so they stay
// close to white — just enough variation that no two pieces match.
const TINT_LIGHT = new THREE.Color('#fff4e0')
const TINT_DEEP = new THREE.Color('#dda861')

export class Experience {
  constructor(canvas, { reducedMotion = false } = {}) {
    this.canvas = canvas
    this.reducedMotion = reducedMotion
    this.isMobile = window.innerWidth < 768
    this.scrollP = 0
    this.pointer = new THREE.Vector2()
    this.pointerLerped = new THREE.Vector2()
    this.shake = 0
    this.phase = 'intro' // intro | exploding | settling | ambient
    this.clock = new THREE.Clock()
    this.explodeTime = 0
    this.disposed = false

    this.initRenderer()
    this.initScene()
    this.initLights()
    this.initDust()
    this.initPopcornField()
    this.initBucket()
    this.initIntroProps()
    this.initBurstPool()
    this.initPost()

    this.look = {
      camDist: 4.6, camHeight: 0.35, bloom: 0.35, keyIntensity: 1.6,
      bucketX: 0, bucketY: -1.35, bucketZ: -0.5, bucketScale: 0.9,
    }
    if (this.isMobile) {
      this.look.bucketY = -1.85
      this.look.bucketZ = -1.1
    }
    this.keyColorTarget = new THREE.Color(THEMES.hero.key)
    this.rimColorTarget = new THREE.Color(THEMES.hero.rim)
    this.fogColorTarget = new THREE.Color(THEMES.hero.fog)

    window.addEventListener('resize', this.onResize)
    window.addEventListener('pointermove', this.onPointerMove, { passive: true })
    this.offCart = bus.on('cart:add', () => this.addToCartFx())

    gsap.ticker.add(this.update)
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.75 : 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 0.95
    // Soft shadows are a big part of the photoreal look; skip them on
    // mobile GPUs to hold 60fps
    this.renderer.shadowMap.enabled = !this.isMobile
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  initScene() {
    this.scene = new THREE.Scene()
    const fogColor = new THREE.Color(THEMES.hero.fog)
    this.scene.fog = new THREE.FogExp2(fogColor, 0.055)
    this.scene.background = fogColor
    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 60)
    this.camera.position.set(0, 0.25, 4.6)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(createStudioEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.85
    pmrem.dispose()
  }

  initLights() {
    this.keyLight = new THREE.DirectionalLight('#ffd9a0', 1.6)
    this.keyLight.position.set(2.5, 3.5, 3)
    this.keyLight.castShadow = true
    this.keyLight.shadow.mapSize.set(1024, 1024)
    this.keyLight.shadow.camera.left = -3.5
    this.keyLight.shadow.camera.right = 3.5
    this.keyLight.shadow.camera.top = 3.5
    this.keyLight.shadow.camera.bottom = -3.5
    this.keyLight.shadow.camera.near = 0.5
    this.keyLight.shadow.camera.far = 12
    this.keyLight.shadow.bias = -0.002
    this.keyLight.shadow.radius = 5
    this.rimLight = new THREE.DirectionalLight('#ff9d3c', 1.2)
    this.rimLight.position.set(-3, 1.5, -3.5)
    this.fillLight = new THREE.HemisphereLight('#fff2dd', '#2a1a0a', 0.3)
    this.glowLight = new THREE.PointLight('#e0a04a', 2.2, 9, 2)
    this.glowLight.position.set(0, 0.4, 1.4)
    this.scene.add(this.keyLight, this.rimLight, this.fillLight, this.glowLight)
  }

  initDust() {
    const count = this.isMobile ? 220 : 480
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1
      speeds[i] = 0.1 + Math.random() * 0.35
    }
    this.dustSpeeds = speeds
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      color: '#f2c073',
      size: 0.02,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    this.dust = new THREE.Points(geo, mat)
    this.scene.add(this.dust)
  }

  makeCaramelPopcornMaterial() {
    // Sticky caramel glaze: mottled albedo + granular bump + uneven
    // roughness over baked vertex colors, sealed with a wet clearcoat.
    if (!this.caramelMaps) this.caramelMaps = createCaramelTextures()
    const { map, bumpMap, roughnessMap } = this.caramelMaps
    return new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      vertexColors: true,
      map,
      bumpMap,
      bumpScale: 0.5,
      roughnessMap,
      roughness: 0.5,
      metalness: 0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.22,
      sheen: 0.2,
      sheenColor: new THREE.Color('#ffd98e'),
    })
  }

  initPopcornField() {
    const count = this.isMobile ? 110 : 240
    this.fieldCount = count
    const geo = createPopcornGeometry(3)
    this.popcornMat = this.makeCaramelPopcornMaterial()
    const mesh = new THREE.InstancedMesh(geo, this.popcornMat, count)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    this.field = []
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const home = new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        -0.8 - Math.random() * 6.5
      )
      // Keep a readable window clear in the middle
      if (Math.abs(home.x) < 2.4 && Math.abs(home.y) < 1.8) home.x += home.x < 0 ? -2.5 : 2.5
      this.field.push({
        home,
        pos: new THREE.Vector3(0, 0.1, 0),
        vel: new THREE.Vector3(),
        rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        rotSpeed: (Math.random() - 0.5) * 1.6,
        scale: 0.09 + Math.random() * 0.12,
        bobPhase: Math.random() * Math.PI * 2,
        bobSpeed: 0.3 + Math.random() * 0.5,
        settleT: 0,
      })
      color.copy(TINT_LIGHT).lerp(TINT_DEEP, Math.random() * 0.6)
      mesh.setColorAt(i, color)
    }
    mesh.count = 0 // hidden until the explosion
    this.fieldMesh = mesh
    this.scene.add(mesh)
  }

  initBucket() {
    this.bucket = new THREE.Group()

    const bodyGeo = new THREE.CylinderGeometry(1.02, 0.74, 1.55, 64, 1, true)
    const bodyMat = new THREE.MeshPhysicalMaterial({
      map: createBucketTexture(),
      roughness: 0.34,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
      side: THREE.DoubleSide,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.castShadow = true
    body.receiveShadow = true
    this.bucket.add(body)

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.03, 0.05, 20, 72),
      new THREE.MeshPhysicalMaterial({ color: '#f6ecd8', roughness: 0.3, clearcoat: 0.8 })
    )
    rim.rotation.x = Math.PI / 2
    rim.position.y = 0.775
    this.bucket.add(rim)

    const base = new THREE.Mesh(
      new THREE.CircleGeometry(0.74, 48),
      new THREE.MeshStandardMaterial({ color: '#e8dcc2', roughness: 0.5 })
    )
    base.rotation.x = -Math.PI / 2
    base.position.y = -0.774
    this.bucket.add(base)

    // Caramel drips hanging off the rim
    const dripMat = new THREE.MeshPhysicalMaterial({
      color: '#a35f0d',
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      ior: 1.45,
    })
    for (let i = 0; i < 7; i++) {
      const len = 0.14 + Math.random() * 0.3
      const drip = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, len, 6, 12), dripMat)
      const a = (i / 7) * Math.PI * 2 + Math.random() * 0.5
      drip.position.set(Math.cos(a) * 1.02, 0.72 - len / 2, Math.sin(a) * 1.02)
      this.bucket.add(drip)
    }

    // Heap of glossy popcorn overflowing the top — two shape variants, with
    // occlusion baked into the tints (pieces buried deeper sit darker).
    const heapCount = this.isMobile ? 90 : 140
    const half = Math.ceil(heapCount / 2)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const s = new THREE.Vector3()
    const p = new THREE.Vector3()
    const color = new THREE.Color()
    for (const seed of [11, 29]) {
      const heap = new THREE.InstancedMesh(
        createPopcornGeometry(seed),
        this.makeCaramelPopcornMaterial(),
        half
      )
      heap.castShadow = true
      heap.receiveShadow = true
      for (let i = 0; i < half; i++) {
        const r = Math.sqrt(Math.random()) * 0.92
        const a = Math.random() * Math.PI * 2
        const domeY = Math.sqrt(Math.max(0, 0.95 * 0.95 - r * r)) * 0.6
        p.set(Math.cos(a) * r, 0.72 + domeY + (Math.random() - 0.08) * 0.1, Math.sin(a) * r)
        e.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
        q.setFromEuler(e)
        const sc = 0.2 + Math.random() * 0.14
        s.set(sc, sc, sc)
        m.compose(p, q, s)
        heap.setMatrixAt(i, m)
        // ambient occlusion: pieces low in the dome read darker
        const ao = 0.62 + 0.38 * (domeY / 0.6)
        color.copy(TINT_LIGHT).lerp(TINT_DEEP, Math.random() * 0.6).multiplyScalar(ao)
        heap.setColorAt(i, color)
      }
      this.bucket.add(heap)
    }

    this.bucket.position.set(0, -1.35, -0.5)
    this.bucket.scale.setScalar(0.001)
    this.bucket.visible = false
    this.bucketJump = { y: 0, squash: 1 }
    this.scene.add(this.bucket)
  }

  initIntroProps() {
    // The lone hero kernel, waiting in darkness
    this.heroKernel = new THREE.Mesh(createPopcornGeometry(5), this.makeCaramelPopcornMaterial())
    this.heroKernel.scale.setScalar(0.5)
    this.heroKernel.position.set(0, 0, 0.5)
    this.scene.add(this.heroKernel)

    // The caramel drip
    this.drip = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 24, 24),
      new THREE.MeshPhysicalMaterial({
        color: '#c47a12',
        roughness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        emissive: '#7a4a12',
        emissiveIntensity: 0.3,
      })
    )
    this.drip.scale.set(0.8, 1.6, 0.8)
    this.drip.position.set(0, 4, 0.5)
    this.drip.visible = false
    this.scene.add(this.drip)
  }

  initBurstPool() {
    const count = 42
    this.burstCount = count
    this.burstMesh = new THREE.InstancedMesh(
      createPopcornGeometry(23),
      this.makeCaramelPopcornMaterial(),
      count
    )
    this.burstMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    const color = new THREE.Color()
    this.burst = []
    for (let i = 0; i < count; i++) {
      this.burst.push({ pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: 0, scale: 0.12 })
      color.copy(TINT_LIGHT).lerp(TINT_DEEP, Math.random() * 0.6)
      this.burstMesh.setColorAt(i, color)
    }
    this.burstMesh.count = 0
    this.scene.add(this.burstMesh)
  }

  initPost() {
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.35, 0.7, 0.88
    )
    this.composer.addPass(this.bloomPass)
    this.composer.addPass(new OutputPass())
  }

  /* ------------------------------------------------ intro sequence */

  playIntro() {
    if (this.reducedMotion) {
      this.finishIntroInstantly()
      return
    }
    // Wait until a few frames have actually rendered — shader compilation can
    // stall the first second, and the timeline would fast-forward past the drama.
    this._startIntroAfterFrame = () => {
      this.introTl = gsap.timeline()
      this.introTl
        .to({}, { duration: 1.1 }) // hold on the lone kernel
        .call(() => { this.drip.visible = true })
        .to(this.drip.position, { y: 0.18, duration: 1.05, ease: 'power2.in' })
        .to(this.drip.scale, { y: 2.4, duration: 0.5, ease: 'power2.in' }, '<0.55')
        .call(() => this.boom())
        .to({}, { duration: 1.4 })
        .call(() => this.showBucket())
    }
  }

  skipIntro() {
    this._startIntroAfterFrame = null
    this.introTl?.kill()
    this.finishIntroInstantly()
  }

  finishIntroInstantly() {
    this.drip.visible = false
    this.heroKernel.visible = false
    this.phase = 'ambient'
    this.fieldMesh.count = this.fieldCount
    this.field.forEach((f) => f.pos.copy(f.home))
    this.bucket.visible = true
    this.bucket.scale.setScalar(1)
    bus.emit('intro:boom')
    bus.emit('intro:done')
  }

  boom() {
    this.drip.visible = false
    this.heroKernel.visible = false
    this.shake = 1
    this.phase = 'exploding'
    this.explodeTime = 0
    this.fieldMesh.count = this.fieldCount
    for (const f of this.field) {
      f.pos.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0.5)
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.35,
        (Math.random() - 0.5) * 0.7
      ).normalize()
      f.vel.copy(dir).multiplyScalar(4.5 + Math.random() * 7)
      f.settleT = 0
    }
    bus.emit('intro:boom')
  }

  showBucket() {
    this.bucket.visible = true
    gsap.to(this.bucket.scale, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'elastic.out(1, 0.55)' })
    gsap.delayedCall(0.55, () => bus.emit('intro:done'))
  }

  /* ------------------------------------------------ interactions */

  addToCartFx() {
    // Bucket does a happy jump with squash & stretch
    gsap.killTweensOf(this.bucketJump)
    gsap.timeline()
      .to(this.bucketJump, { squash: 0.82, duration: 0.1, ease: 'power2.in' })
      .to(this.bucketJump, { y: 0.55, squash: 1.12, duration: 0.28, ease: 'power2.out' })
      .to(this.bucketJump, { y: 0, duration: 0.55, ease: 'bounce.out' }, '>')
      .to(this.bucketJump, { squash: 1, duration: 0.5, ease: 'elastic.out(1,0.4)' }, '<')

    // Popcorn erupts from the bucket
    this.burstMesh.count = this.burstCount
    const origin = new THREE.Vector3()
    this.bucket.getWorldPosition(origin)
    origin.y += 0.9 * this.bucket.scale.x
    for (const b of this.burst) {
      b.pos.copy(origin)
      b.vel.set((Math.random() - 0.5) * 3.4, 2.6 + Math.random() * 2.6, (Math.random() - 0.5) * 3.4)
      b.life = 1.25
      b.scale = 0.09 + Math.random() * 0.1
    }
    this.shake = Math.max(this.shake, 0.3)
  }

  setTheme(name) {
    const t = THEMES[name]
    if (!t || this.currentTheme === name) return
    this.currentTheme = name
    gsap.to(this.look, {
      camDist: t.camDist,
      camHeight: t.camHeight,
      bloom: t.bloom,
      keyIntensity: t.keyIntensity,
      bucketX: t.bucket[0] * (this.isMobile ? 0.35 : 1),
      bucketY: t.bucket[1] - (this.isMobile ? 0.5 : 0),
      bucketZ: t.bucket[2] - (this.isMobile ? 0.6 : 0),
      bucketScale: t.scale,
      duration: 1.6,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
    this.keyColorTarget.set(t.key)
    this.rimColorTarget.set(t.rim)
    this.fogColorTarget.set(t.fog)
  }

  setScroll(p) {
    this.scrollP = p
  }

  onPointerMove = (e) => {
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
  }

  onResize = () => {
    this.isMobile = window.innerWidth < 768
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.composer.setSize(window.innerWidth, window.innerHeight)
  }

  /* ------------------------------------------------ frame loop */

  update = () => {
    if (this.disposed) return
    const dt = Math.min(this.clock.getDelta(), 0.05)
    const t = this.clock.elapsedTime

    // Lone intro kernel slowly spinning
    if (this.heroKernel.visible) {
      this.heroKernel.rotation.y += dt * 0.7
      this.heroKernel.rotation.x = Math.sin(t * 0.6) * 0.25
      this.heroKernel.position.y = Math.sin(t * 1.2) * 0.06
    }

    // Dust drift
    const dp = this.dust.geometry.attributes.position
    for (let i = 0; i < dp.count; i++) {
      let y = dp.getY(i) + this.dustSpeeds[i] * dt * 0.35
      if (y > 4.5) y = -4.5
      dp.setY(i, y)
    }
    dp.needsUpdate = true
    this.dust.rotation.y = t * 0.015 + this.scrollP * 0.6

    // Popcorn field: explosion physics, then settle into ambient float
    if (this.phase === 'exploding' || this.phase === 'settling' || this.phase === 'ambient') {
      const m = this._m4 || (this._m4 = new THREE.Matrix4())
      const q = this._q || (this._q = new THREE.Quaternion())
      const s = this._s || (this._s = new THREE.Vector3())
      const v = this._v || (this._v = new THREE.Vector3())
      if (this.phase === 'exploding') {
        this.explodeTime += dt
        if (this.explodeTime > 1.5) this.phase = 'settling'
      }
      for (let i = 0; i < this.fieldCount; i++) {
        const f = this.field[i]
        if (this.phase === 'exploding') {
          f.vel.y -= 3.2 * dt
          f.vel.multiplyScalar(1 - 1.1 * dt)
          f.pos.addScaledVector(f.vel, dt)
        } else if (this.phase === 'settling') {
          f.settleT = Math.min(1, f.settleT + dt * 0.55)
          const k = f.settleT * f.settleT * (3 - 2 * f.settleT)
          f.pos.lerp(f.home, k * dt * 4)
          if (i === 0 && f.settleT >= 1) this.phase = 'ambient'
        }
        const bobY = Math.sin(t * f.bobSpeed + f.bobPhase) * 0.25
        const bobX = Math.cos(t * f.bobSpeed * 0.7 + f.bobPhase) * 0.15
        if (this.phase === 'ambient') {
          v.set(f.home.x + bobX, f.home.y + bobY + this.scrollP * 1.6, f.home.z)
        } else {
          v.copy(f.pos)
        }
        f.rot.y += f.rotSpeed * dt
        f.rot.x += f.rotSpeed * 0.6 * dt
        q.setFromEuler(f.rot)
        s.setScalar(f.scale)
        m.compose(v, q, s)
        this.fieldMesh.setMatrixAt(i, m)
      }
      this.fieldMesh.instanceMatrix.needsUpdate = true
    }

    // Add-to-cart burst particles
    if (this.burstMesh.count > 0) {
      const m = new THREE.Matrix4()
      const q = new THREE.Quaternion()
      const e = new THREE.Euler()
      const s = new THREE.Vector3()
      let alive = false
      for (let i = 0; i < this.burstCount; i++) {
        const b = this.burst[i]
        if (b.life > 0) {
          alive = true
          b.life -= dt
          b.vel.y -= 7.5 * dt
          b.pos.addScaledVector(b.vel, dt)
          e.set(t * 3 + i, t * 2.4 + i * 0.7, 0)
          q.setFromEuler(e)
          const sc = b.scale * Math.min(1, b.life * 3)
          s.setScalar(Math.max(0.001, sc))
          m.compose(b.pos, q, s)
        } else {
          s.setScalar(0.0001)
          m.compose(b.pos, q.identity(), s)
        }
        this.burstMesh.setMatrixAt(i, m)
      }
      this.burstMesh.instanceMatrix.needsUpdate = true
      if (!alive) this.burstMesh.count = 0
    }

    // Bucket: slow luxurious rotation + jump physics + pointer tilt
    if (this.bucket.visible) {
      this.bucket.rotation.y = t * 0.24 + this.scrollP * Math.PI * 2.4
      this.bucket.position.set(
        this.look.bucketX,
        this.look.bucketY + this.bucketJump.y,
        this.look.bucketZ
      )
      const sq = this.bucketJump.squash
      const base = this.look.bucketScale
      // Only override scale once the intro pop-in tween has finished
      if (this.phase === 'ambient' || this.phase === 'settling') {
        this.bucket.scale.set(base * (2 - sq), base * sq, base * (2 - sq))
      }
      this.bucket.rotation.z = -this.pointerLerped.x * 0.06
      this.bucket.rotation.x = this.pointerLerped.y * 0.04
    }

    // Camera: scroll-directed orbit + pointer parallax + shake
    this.pointerLerped.lerp(this.pointer, 0.05)
    const angle = this.scrollP * Math.PI * 0.9
    const dist = this.look.camDist
    let cx = Math.sin(angle) * dist * 0.35 + this.pointerLerped.x * 0.35
    let cy = this.look.camHeight + Math.sin(this.scrollP * Math.PI * 2) * 0.25 - this.pointerLerped.y * 0.25
    let cz = (0.62 + 0.38 * Math.cos(angle * 0.5)) * dist
    if (this.shake > 0.001) {
      this.shake *= Math.pow(0.0005, dt)
      cx += (Math.random() - 0.5) * 0.22 * this.shake
      cy += (Math.random() - 0.5) * 0.22 * this.shake
    }
    this.camera.position.set(cx, cy, cz)
    this.camera.lookAt(this.look.bucketX * 0.4, -0.1, 0)

    // Lighting drifts toward the active theme
    this.keyLight.color.lerp(this.keyColorTarget, 0.04)
    this.keyLight.intensity += (this.look.keyIntensity - this.keyLight.intensity) * 0.04
    this.rimLight.color.lerp(this.rimColorTarget, 0.04)
    this.scene.fog.color.lerp(this.fogColorTarget, 0.04)
    this.scene.background.lerp(this.fogColorTarget, 0.04)
    this.glowLight.color.lerp(this.keyColorTarget, 0.04)
    this.glowLight.intensity = 2 + Math.sin(t * 1.4) * 0.6
    this.bloomPass.strength = this.look.bloom

    this.composer.render()

    this._frames = (this._frames || 0) + 1
    if (this._frames === 3 && this._startIntroAfterFrame) {
      const start = this._startIntroAfterFrame
      this._startIntroAfterFrame = null
      // Restart the clock so the first stall doesn't count against the intro
      this.clock.getDelta()
      start()
    }
  }

  dispose() {
    this.disposed = true
    gsap.ticker.remove(this.update)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pointermove', this.onPointerMove)
    this.offCart?.()
    this.introTl?.kill()
    this.renderer.dispose()
  }
}
