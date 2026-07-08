import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// A popcorn kernel is a cluster of displaced blobs merged into one geometry —
// the classic "butterfly" popcorn silhouette without any external model.
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function createPopcornGeometry(seed = 1) {
  const rng = makeRng(seed * 999 + 7)
  const blobs = []
  const count = 6 + Math.floor(rng() * 3)
  for (let i = 0; i < count; i++) {
    const r = 0.28 + rng() * 0.3
    const blob = new THREE.IcosahedronGeometry(r, 2)
    const dir = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5)
      .normalize()
      .multiplyScalar(0.16 + rng() * 0.3)
    // Lumpy surface displacement
    const pos = blob.attributes.position
    const v = new THREE.Vector3()
    for (let j = 0; j < pos.count; j++) {
      v.fromBufferAttribute(pos, j)
      const n =
        Math.sin(v.x * 9 + seed) * Math.sin(v.y * 8 + seed * 2) * Math.sin(v.z * 7 + seed * 3)
      v.multiplyScalar(1 + n * 0.14)
      pos.setXYZ(j, v.x + dir.x, v.y + dir.y, v.z + dir.z)
    }
    blobs.push(blob)
  }
  const merged = mergeGeometries(blobs)
  merged.computeVertexNormals()
  blobs.forEach((b) => b.dispose())
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
