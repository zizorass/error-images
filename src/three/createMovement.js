import * as THREE from 'three'

const dummy = new THREE.Object3D()

function randRange(min, max) {
  return min + Math.random() * (max - min)
}

// Populates `movementGroup` with several hundred small mechanical components
// (gear rings, pinions, plates, spring coils, jewels). Each instance stores
// an "assembled" transform (tight, disc-shaped, like a real movement) and an
// "exploded" transform (scattered through the scene) so the whole thing can
// be scrubbed by a single explode factor 0..1.
export function createMovement(movementGroup) {
  const pools = []

  function addPool(geometry, material, count, assembledFn, explodedRadius) {
    const mesh = new THREE.InstancedMesh(geometry, material, count)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    const items = []
    for (let i = 0; i < count; i++) {
      const assembled = assembledFn(i)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = randRange(explodedRadius * 0.5, explodedRadius)
      const exploded = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * r,
        Math.sin(phi) * Math.sin(theta) * r,
        // clamp toward-camera depth so nothing explodes into the lens during
        // the dolly-in — the camera gets as close as z=2.3
        Math.min(Math.cos(phi) * r * 0.7, 1.0)
      )
      items.push({
        assembled: assembled.pos,
        assembledRot: assembled.rot,
        exploded,
        spin: new THREE.Vector3(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1)).normalize(),
        spinSpeed: randRange(0.2, 1.4),
        phase: Math.random() * Math.PI * 2,
      })
    }
    movementGroup.add(mesh)
    pools.push({ mesh, items })
  }

  const metalMat = new THREE.MeshPhysicalMaterial({ color: '#c9ccd1', metalness: 1, roughness: 0.28, envMapIntensity: 1.4 })
  const goldMat = new THREE.MeshPhysicalMaterial({ color: '#d8b877', metalness: 0.9, roughness: 0.3, envMapIntensity: 1.4 })
  const jewelMat = new THREE.MeshPhysicalMaterial({ color: '#c81d34', metalness: 0.2, roughness: 0.1, emissive: '#5a0410', emissiveIntensity: 0.6 })
  const darkMat = new THREE.MeshPhysicalMaterial({ color: '#3a3d42', metalness: 0.8, roughness: 0.4, envMapIntensity: 1.2 })

  // gear rings — thin toruses stacked around the assembled disc
  addPool(
    new THREE.TorusGeometry(0.09, 0.02, 8, 20),
    metalMat,
    70,
    (i) => {
      const a = (i / 70) * Math.PI * 2 * 3
      const r = 0.15 + (i % 7) * 0.09
      return {
        pos: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, randRange(-0.08, 0.08)),
        rot: new THREE.Euler(randRange(0, Math.PI), randRange(0, Math.PI), 0),
      }
    },
    3.2
  )

  // pinions — small cylinders (posts/gear axles)
  addPool(
    new THREE.CylinderGeometry(0.015, 0.015, 0.22, 10),
    goldMat,
    60,
    (i) => {
      const a = (i / 60) * Math.PI * 2 * 4.5
      const r = 0.1 + (i % 9) * 0.075
      return {
        pos: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, randRange(-0.1, 0.1)),
        rot: new THREE.Euler(Math.PI / 2, randRange(0, Math.PI), 0),
      }
    },
    3.6
  )

  // bridges/plates — thin flat rectangles
  addPool(
    new THREE.BoxGeometry(0.28, 0.09, 0.015),
    darkMat,
    40,
    (i) => {
      const a = (i / 40) * Math.PI * 2 * 2
      const r = 0.2 + (i % 5) * 0.13
      return {
        pos: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, randRange(-0.06, 0.06)),
        rot: new THREE.Euler(0, 0, a),
      }
    },
    2.8
  )

  // spring coils — thin toruses, larger radius
  addPool(
    new THREE.TorusGeometry(0.16, 0.008, 6, 24),
    metalMat,
    30,
    (i) => {
      const a = (i / 30) * Math.PI * 2
      return {
        pos: new THREE.Vector3(Math.cos(a) * 0.05, Math.sin(a) * 0.05, i * 0.004 - 0.06),
        rot: new THREE.Euler(0, 0, a * 3),
      }
    },
    2.4
  )

  // jewels — tiny glowing spheres
  addPool(
    new THREE.SphereGeometry(0.025, 10, 10),
    jewelMat,
    28,
    (i) => {
      const a = (i / 28) * Math.PI * 2 * 5
      const r = 0.12 + (i % 6) * 0.1
      return {
        pos: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, randRange(-0.1, 0.1)),
        rot: new THREE.Euler(0, 0, 0),
      }
    },
    3.8
  )

  function update(explodeFactor, time) {
    const ease = explodeFactor * explodeFactor * (3 - 2 * explodeFactor) // smoothstep
    pools.forEach(({ mesh, items }) => {
      items.forEach((it, i) => {
        dummy.position.lerpVectors(it.assembled, it.exploded, ease)
        const spin = time * it.spinSpeed * ease + it.phase
        dummy.rotation.set(
          it.assembledRot.x + it.spin.x * spin,
          it.assembledRot.y + it.spin.y * spin,
          it.assembledRot.z + it.spin.z * spin
        )
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    })
  }

  return { update, pools }
}
