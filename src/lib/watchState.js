// Shared, GSAP-tweened watch state. Section components create scrub-linked
// ScrollTrigger timelines that animate these plain numeric properties;
// Scene3D reads the current values every frame and feeds them to the
// Three.js SceneManager. Because everything here is just numbers on a plain
// object, GSAP scrubbing forward/back reverses the whole experience for free.
export const watchState = {
  watchPos: { x: 1.3, y: -0.15, z: 0 },
  watchScale: 0.85,
  watchRotY: 0,
  watchRotX: 0,
  collectionSpin: 0, // radians accumulated through the Color Collection section
  openFactor: 0,
  explodeFactor: 0,
  camPos: { x: 0, y: 0, z: 5.4 },
  camLookAt: { x: 0, y: 0, z: 0 },
}
