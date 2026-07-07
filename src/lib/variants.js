// The five CHROME finishes. Every animated surface (3D materials, ambient
// light, page backgrounds, typography accents) derives from this table.
export const VARIANTS = [
  {
    id: 'obsidian',
    name: 'Obsidian Black',
    tagline: 'Matte titanium, forged in shadow.',
    case: '#161618',
    caseMetalness: 0.75,
    caseRoughness: 0.55,
    dial: '#020203',
    bezel: '#0c0c0e',
    accent: '#5aa7ff',
    bg: ['#050506', '#0c0d10', '#050506'],
    light: '#7fb4ff',
  },
  {
    id: 'silver',
    name: 'Silver Chrome',
    tagline: 'Polished steel, mirror precision.',
    case: '#d9dde1',
    caseMetalness: 1,
    caseRoughness: 0.12,
    dial: '#eef1f4',
    bezel: '#c3c8cd',
    accent: '#ffffff',
    bg: ['#0a0a0b', '#2a2c30', '#0a0a0b'],
    light: '#ffffff',
  },
  {
    id: 'blue',
    name: 'Midnight Blue',
    tagline: 'Deep navy metallic, ocean depth.',
    case: '#16233f',
    caseMetalness: 0.85,
    caseRoughness: 0.3,
    dial: '#1b2f57',
    bezel: '#101a30',
    accent: '#5b7fff',
    bg: ['#03050c', '#0b1330', '#03050c'],
    light: '#5b7fff',
  },
  {
    id: 'green',
    name: 'Emerald Green',
    tagline: 'Racing green, quiet velocity.',
    case: '#0e2b1f',
    caseMetalness: 0.85,
    caseRoughness: 0.3,
    dial: '#123524',
    bezel: '#0a1f16',
    accent: '#23c17a',
    bg: ['#030a06', '#0a2015', '#030a06'],
    light: '#23c17a',
  },
  {
    id: 'rose',
    name: 'Rose Gold',
    tagline: 'Warm gold, luxury unhurried.',
    case: '#b76e58',
    caseMetalness: 0.9,
    caseRoughness: 0.22,
    dial: '#f2e2d0',
    bezel: '#8f5744',
    accent: '#e8a992',
    bg: ['#0a0605', '#2a1712', '#0a0605'],
    light: '#e8a992',
  },
]

export function lerpHex(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16)
  const b = parseInt(hexB.slice(1), 16)
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `rgb(${r}, ${g}, ${bl})`
}
