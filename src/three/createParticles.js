import * as THREE from 'three'

const dummy = new THREE.Object3D()

// Ambient floating gears / sapphire shards / metallic dust that drift through
// the whole experience and gently react to cursor proximity.
export function createParticles() {
  const group = new THREE.Group()
  group.name = 'particles'

  const shardMat = new THREE.MeshPhysicalMaterial({
    color: '#bcd8ff',
    metalness: 0,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 0.3,
    ior: 1.6,
    transparent: true,
    opacity: 0.85,
  })
  const gearMat = new THREE.MeshPhysicalMaterial({ color: '#9aa0a8', metalness: 1, roughness: 0.35 })
  const dustMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5 })

  const shardCount = 26
  const gearCount = 16
  const dustCount = 90

  const shards = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.06, 0), shardMat, shardCount)
  const gears = new THREE.InstancedMesh(new THREE.TorusGeometry(0.09, 0.018, 8, 18), gearMat, gearCount)
  const dust = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 6, 6), dustMat, dustCount)

  const pools = []

  function seed(count, spread) {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({
        base: new THREE.Vector3(
          (Math.random() - 0.5) * spread.x,
          (Math.random() - 0.5) * spread.y,
          // bias away from the camera's dolly-in path (z ~2.3..6.5) so
          // nothing drifts close enough to camera to blow up into a blob
          -1.6 + (Math.random() - 0.5) * spread.z,
        ),
        amp: new THREE.Vector3(Math.random() * 0.4 + 0.1, Math.random() * 0.4 + 0.1, Math.random() * 0.3),
        speed: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        spin: Math.random() * 1.2 + 0.2,
      })
    }
    return arr
  }

  const shardData = seed(shardCount, new THREE.Vector3(7, 5, 3))
  const gearData = seed(gearCount, new THREE.Vector3(8, 5.5, 3))
  const dustData = seed(dustCount, new THREE.Vector3(9, 6, 4))

  group.add(shards, gears, dust)
  pools.push({ mesh: shards, data: shardData })
  pools.push({ mesh: gears, data: gearData })
  pools.push({ mesh: dust, data: dustData })

  function update(time, mouse) {
    pools.forEach(({ mesh, data }) => {
      data.forEach((d, i) => {
        const x = d.base.x + Math.sin(time * d.speed + d.phase) * d.amp.x
        const y = d.base.y + Math.cos(time * d.speed * 0.8 + d.phase) * d.amp.y
        const z = d.base.z + Math.sin(time * d.speed * 0.6 + d.phase * 1.3) * d.amp.z

        // cursor proximity repulsion in an approximate world-space plane
        const mx = mouse.x * 4.2
        const my = mouse.y * 2.6
        const dx = x - mx
        const dy = y - my
        const distSq = dx * dx + dy * dy
        let px = x
        let py = y
        if (distSq < 2.4) {
          const dist = Math.sqrt(distSq) || 0.001
          const push = (2.4 - distSq) * 0.35
          px += (dx / dist) * push
          py += (dy / dist) * push
        }

        dummy.position.set(px, py, z)
        dummy.rotation.set(time * d.spin, time * d.spin * 0.7, 0)
        const s = 1
        dummy.scale.setScalar(s)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    })
  }

  return { group, update }
}
