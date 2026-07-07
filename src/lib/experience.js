// Tiny mutable store read directly by the rAF loop (Three.js side) so we
// avoid triggering React re-renders 60x/sec. GSAP ScrollTrigger callbacks and
// pointer listeners write into it; SceneManager reads it every frame.
export const experience = {
  mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
  scroll: {
    heroProgress: 0, // 0..1 within hero
    craftProgress: 0,
    movementProgress: 0, // 0..1 pinned precision-movement section
    collectionProgress: 0, // 0..1 pinned color-collection section
    globalProgress: 0, // 0..1 across full document
  },
  ready: false,
}

export function setMouse(nx, ny) {
  experience.mouse.targetX = nx
  experience.mouse.targetY = ny
}
