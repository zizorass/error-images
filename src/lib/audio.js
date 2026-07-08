// All sound is synthesized with WebAudio — zero audio assets to download.
let ctx = null
let master = null
let muted = false

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// Call once from a user gesture so the context is allowed to run.
export function unlockAudio() {
  ensureCtx()
}

export function setMuted(value) {
  muted = value
  if (master) master.gain.value = muted ? 0 : 0.6
}

export function isMuted() {
  return muted
}

export function bassHit() {
  const c = ensureCtx()
  if (!c || c.state !== 'running' || muted) return
  const t = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(120, t)
  osc.frequency.exponentialRampToValueAtTime(34, t + 0.35)
  gain.gain.setValueAtTime(0.9, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
  osc.connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + 0.75)

  // Noise thump layered on top for the "impact" texture.
  const len = c.sampleRate * 0.18
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 320
  const ngain = c.createGain()
  ngain.gain.setValueAtTime(0.5, t)
  ngain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  noise.connect(filter).connect(ngain).connect(master)
  noise.start(t)
}

export function pop(pitch = 1) {
  const c = ensureCtx()
  if (!c || c.state !== 'running' || muted) return
  const t = c.currentTime
  const len = c.sampleRate * 0.06
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1400 * pitch
  filter.Q.value = 1.4
  const gain = c.createGain()
  gain.gain.setValueAtTime(0.35, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
  noise.connect(filter).connect(gain).connect(master)
  noise.start(t)
}

export function chime() {
  const c = ensureCtx()
  if (!c || c.state !== 'running' || muted) return
  const t = c.currentTime
  ;[523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, t + i * 0.06)
    gain.gain.linearRampToValueAtTime(0.12, t + i * 0.06 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.5)
    osc.connect(gain).connect(master)
    osc.start(t + i * 0.06)
    osc.stop(t + i * 0.06 + 0.55)
  })
}
