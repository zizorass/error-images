import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// A popcorn kernel is a cluster of smooth, puffy lobes merged into one
// geometry, with caramel shading baked into vertex colors: deep amber in the
// crevices, lighter crystallized gold on the outer ridges — like the real
// caramel-coated product.
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const DEEP = new THREE.Color('#a05a12')
const MID = new THREE.Color('#dd9d3f')
const LIGHT = new THREE.Color('#f8dca6')

// Procedural micro-surface for the caramel glaze: mottled albedo, granular
// bump (sugar crystals + drips) and uneven roughness so highlights break up
// the way they do on real sticky popcorn instead of reading as smooth CG.
export function createCaramelTextures() {
  const size = 512

  const makeCanvas = (draw) => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const g = canvas.getContext('2d')
    draw(g)
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
  }

  const rand = makeRng(1337)

  const blotch = (g, count, colors, rMin, rMax) => {
    for (let i = 0; i < count; i++) {
      const x = rand() * size
      const y = rand() * size
      const r = rMin + rand() * (rMax - rMin)
      const grad = g.createRadialGradient(x, y, 0, x, y, r)
      const c = colors[Math.floor(rand() * colors.length)]
      grad.addColorStop(0, c)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = grad
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
  }

  const grain = (g, strength) => {
    const img = g.getImageData(0, 0, size, size)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = (rand() - 0.5) * strength
      d[i] += n
      d[i + 1] += n
      d[i + 2] += n
    }
    g.putImageData(img, 0, 0)
  }

  // Albedo: near-white so it multiplies the baked vertex colors, with
  // subtle darker caramel pools and pale crystallized patches.
  const map = makeCanvas((g) => {
    g.fillStyle = '#f6ede0'
    g.fillRect(0, 0, size, size)
    blotch(g, 200, ['rgba(160,94,26,0.11)', 'rgba(130,70,18,0.08)'], 14, 70)
    blotch(g, 320, ['rgba(255,240,210,0.2)', 'rgba(255,224,168,0.14)'], 6, 30)
    grain(g, 18)
  })
  map.colorSpace = THREE.SRGBColorSpace

  // Bump: coarse drips + fine sugar-crystal specks.
  const bumpMap = makeCanvas((g) => {
    g.fillStyle = '#808080'
    g.fillRect(0, 0, size, size)
    blotch(g, 240, ['rgba(255,255,255,0.22)', 'rgba(0,0,0,0.22)'], 10, 60)
    blotch(g, 2200, ['rgba(255,255,255,0.5)', 'rgba(0,0,0,0.4)'], 0.6, 2.4)
    grain(g, 46)
  })

  // Roughness: mostly glossy with rougher crystallized patches.
  const roughnessMap = makeCanvas((g) => {
    g.fillStyle = '#9a9a9a'
    g.fillRect(0, 0, size, size)
    blotch(g, 200, ['rgba(230,230,230,0.35)'], 8, 46) // rough sugar patches
    blotch(g, 200, ['rgba(70,70,70,0.35)'], 10, 50) // wet caramel pools
    grain(g, 30)
  })

  return { map, bumpMap, roughnessMap }
}

export function createPopcornGeometry(seed = 1) {
  const rng = makeRng(seed * 999 + 7)
  const blobs = []
  const count = 9 + Math.floor(rng() * 4)
  const v = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    const r = 0.3 + rng() * 0.24
    // detail 4 gives enough resolution for fine crinkles without faceting
    const blob = new THREE.IcosahedronGeometry(r, 4)
    // overlap the lobes tightly so they merge into one crinkled mass
    const dir = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5)
      .normalize()
      .multiplyScalar(0.11 + rng() * 0.15)
    // squash each lobe into a random ellipsoid — popcorn lobes aren't round
    const ax = 0.75 + rng() * 0.6
    const ay = 0.75 + rng() * 0.6
    const az = 0.75 + rng() * 0.6
    const s1 = seed + i * 3.7
    const pos = blob.attributes.position
    for (let j = 0; j < pos.count; j++) {
      v.fromBufferAttribute(pos, j)
      v.set(v.x * ax, v.y * ay, v.z * az)
      // three octaves: broad folds, wrinkles, and fine crinkle ridges
      const n =
        Math.sin(v.x * 6 + s1) * Math.sin(v.y * 5.2 + s1 * 2) * 0.58 +
        Math.sin(v.x * 10 + s1 * 2) * Math.sin(v.z * 9 + s1 * 3) * 0.28 +
        Math.sin(v.x * 19 + s1 * 4) * Math.sin(v.y * 18 + s1) * Math.sin(v.z * 17 + s1 * 2) * 0.14
      v.multiplyScalar(1 + n * 0.11)
      pos.setXYZ(j, v.x + dir.x, v.y + dir.y, v.z + dir.z)
    }
    blobs.push(blob)
  }

  const merged = mergeGeometries(blobs)
  merged.computeVertexNormals()
  blobs.forEach((b) => b.dispose())

  // Bake caramel depth into vertex colors: crevices (near the cluster core)
  // go deep amber, outer ridges go light crystallized gold.
  const pos = merged.attributes.position
  let minR = Infinity
  let maxR = 0
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const len = v.length()
    if (len < minR) minR = len
    if (len > maxR) maxR = len
  }
  const colors = new Float32Array(pos.count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    let t = (v.length() - minR) / Math.max(0.0001, maxR - minR)
    // bias toward the light end — real caramel corn is mostly bright
    // butterscotch with deep amber only down in the crevices
    t = Math.pow(Math.min(1, Math.max(0, t)), 0.75)
    if (t < 0.55) c.copy(DEEP).lerp(MID, t / 0.55)
    else c.copy(MID).lerp(LIGHT, (t - 0.55) / 0.45)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return merged
}

// A food-photography lighting rig baked into the environment map: dark warm
// room, one big key softbox, a warm rim strip and a bounce card. Gives the
// caramel the long rectangular highlights of real studio product shots.
export function createStudioEnvironment() {
  const scene = new THREE.Scene()
  const origin = new THREE.Vector3(0, 0, 0)

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(24, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0x140d06, side: THREE.BackSide })
  )
  scene.add(room)

  const softbox = (hex, intensity, w, h, x, y, z) => {
    const mat = new THREE.MeshBasicMaterial()
    mat.color.set(hex).multiplyScalar(intensity)
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    mesh.position.set(x, y, z)
    mesh.lookAt(origin)
    scene.add(mesh)
  }

  softbox('#fff1d6', 7, 7, 5, 5, 6, 5) // key softbox, high right
  softbox('#ffc46b', 3.5, 6, 1.4, -6, 2.5, -4) // warm rim strip, back left
  softbox('#fffaf0', 1.6, 3, 3, -1, -5, 6) // bounce card below camera
  softbox('#ffe9c4', 2.2, 1.2, 8, 7, 1, -5) // tall edge light, back right

  return scene
}

// Bucket label drawn on a canvas — cream base, caramel stripes, wordmark.
export function createBucketTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const g = canvas.getContext('2d')

  g.fillStyle = '#f6ecd8'
  g.fillRect(0, 0, 1024, 512)

  // Caramel stripes
  const stripes = 14
  for (let i = 0; i < stripes; i++) {
    if (i % 2 === 0) continue
    const w = 1024 / stripes
    const grad = g.createLinearGradient(i * w, 0, i * w + w, 0)
    grad.addColorStop(0, '#dfa14b')
    grad.addColorStop(0.5, '#c9821f')
    grad.addColorStop(1, '#dfa14b')
    g.fillStyle = grad
    g.fillRect(i * w, 0, w, 512)
  }

  // Central label band
  g.fillStyle = '#20140a'
  g.fillRect(0, 176, 1024, 160)
  g.fillStyle = '#f2c073'
  g.font = '900 92px Outfit, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.letterSpacing = '6px'
  g.fillText('JOEY KOALA', 512, 246)
  g.font = '500 34px Outfit, sans-serif'
  g.fillStyle = '#f6ecd8'
  g.letterSpacing = '14px'
  g.fillText('GOURMET CARAMEL POPCORN', 512, 306)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
