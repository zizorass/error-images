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

const DEEP = new THREE.Color('#8f4e0e')
const MID = new THREE.Color('#c87d1e')
const LIGHT = new THREE.Color('#edb763')

export function createPopcornGeometry(seed = 1) {
  const rng = makeRng(seed * 999 + 7)
  const blobs = []
  const count = 9 + Math.floor(rng() * 4)
  const v = new THREE.Vector3()

  for (let i = 0; i < count; i++) {
    const r = 0.3 + rng() * 0.24
    // detail 3 keeps the lobes smooth instead of visibly faceted
    const blob = new THREE.IcosahedronGeometry(r, 3)
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
      // low-frequency folds + gentle wrinkle, kept below the mesh resolution
      // so the surface stays smooth rather than faceted
      const n =
        Math.sin(v.x * 6 + s1) * Math.sin(v.y * 5.2 + s1 * 2) * 0.65 +
        Math.sin(v.x * 10 + s1 * 2) * Math.sin(v.z * 9 + s1 * 3) * 0.35
      v.multiplyScalar(1 + n * 0.1)
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
    t = Math.pow(Math.min(1, Math.max(0, t)), 1.15)
    if (t < 0.55) c.copy(DEEP).lerp(MID, t / 0.55)
    else c.copy(MID).lerp(LIGHT, (t - 0.55) / 0.45)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return merged
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
