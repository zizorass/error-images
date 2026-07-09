// Tiny event bus connecting the DOM layer and the WebGL experience.
const listeners = new Map()

export const bus = {
  on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event).add(fn)
    return () => bus.off(event, fn)
  },
  off(event, fn) {
    listeners.get(event)?.delete(fn)
  },
  emit(event, payload) {
    listeners.get(event)?.forEach((fn) => fn(payload))
  },
}
