import * as THREE from 'three'
import { VARIANTS } from '../lib/variants.js'

const tmpColorA = new THREE.Color()
const tmpColorB = new THREE.Color()

// Builds the CHROME watch as a set of named groups so the rest of the app can
// drive "case open", "explode", and "color morph" purely by scrubbing a few
// numeric factors — no re-creating geometry per frame.
export function createWatch() {
  const group = new THREE.Group()
  group.name = 'chrome-watch'

  const v0 = VARIANTS[0]

  const caseMat = new THREE.MeshPhysicalMaterial({
    color: v0.case,
    metalness: v0.caseMetalness,
    roughness: v0.caseRoughness,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.3,
  })
  const bezelMat = new THREE.MeshPhysicalMaterial({
    color: v0.bezel,
    metalness: v0.caseMetalness,
    roughness: Math.max(0.08, v0.caseRoughness - 0.1),
    clearcoat: 0.7,
    envMapIntensity: 1.4,
  })
  const dialMat = new THREE.MeshPhysicalMaterial({
    color: v0.dial,
    metalness: 0.35,
    roughness: 0.45,
    envMapIntensity: 0.8,
  })
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    transmission: 1,
    thickness: 0.4,
    ior: 1.5,
    transparent: true,
    envMapIntensity: 1.6,
  })
  const handMat = new THREE.MeshPhysicalMaterial({
    color: 0xf3f4f6,
    metalness: 1,
    roughness: 0.18,
    envMapIntensity: 1.4,
  })
  const accentMat = new THREE.MeshPhysicalMaterial({
    color: v0.accent,
    metalness: 0.4,
    roughness: 0.3,
    emissive: v0.accent,
    emissiveIntensity: 0.35,
  })

  // ---- case rim (static side wall) ----
  const caseMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.4, 72, 1, true), caseMat)
  caseMesh.rotation.x = Math.PI / 2
  group.add(caseMesh)

  // ---- lugs ----
  const lugGeo = new THREE.BoxGeometry(0.22, 0.32, 0.14)
  ;[
    [0.42, 1.28, 0],
    [-0.42, 1.28, 0],
    [0.42, -1.28, 0],
    [-0.42, -1.28, 0],
  ].forEach(([x, y]) => {
    const lug = new THREE.Mesh(lugGeo, caseMat)
    lug.position.set(x, y, 0)
    group.add(lug)
  })

  // ---- crown ----
  const crownGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.22, 24)
  const crown = new THREE.Mesh(crownGeo, bezelMat)
  crown.rotation.z = Math.PI / 2
  crown.position.set(1.28, -0.05, 0)
  group.add(crown)

  // ---- front lid: bezel + crystal (slides forward on open) ----
  const frontLid = new THREE.Group()
  frontLid.name = 'frontLid'
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.1, 28, 80), bezelMat)
  bezel.position.z = 0.22
  frontLid.add(bezel)
  const crystal = new THREE.Mesh(new THREE.CircleGeometry(1.06, 72), crystalMat)
  crystal.position.z = 0.24
  frontLid.add(crystal)
  group.add(frontLid)

  // ---- dial group: dial face + markers + hands (fades out as case opens) ----
  const dialGroup = new THREE.Group()
  dialGroup.name = 'dialGroup'
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.0, 72), dialMat)
  dial.position.z = 0.19
  dialGroup.add(dial)

  const subDial = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.18, 40), accentMat)
  subDial.position.set(0, -0.42, 0.195)
  dialGroup.add(subDial)

  const markerGeo = new THREE.BoxGeometry(0.05, 0.14, 0.02)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const marker = new THREE.Mesh(markerGeo, handMat)
    marker.position.set(Math.sin(a) * 0.86, Math.cos(a) * 0.86, 0.2)
    marker.rotation.z = -a
    dialGroup.add(marker)
  }

  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.5, 0.02), handMat)
  hourHand.position.set(0, 0.22, 0.21)
  hourHand.geometry.translate(0, 0.25, 0)
  hourHand.position.set(0, -0.03, 0.21)
  hourHand.rotation.z = -0.6
  dialGroup.add(hourHand)

  const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.74, 0.02), handMat)
  minuteHand.geometry.translate(0, 0.37, 0)
  minuteHand.position.set(0, 0, 0.215)
  minuteHand.rotation.z = 1.9
  dialGroup.add(minuteHand)

  const secondHand = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.82, 0.02), accentMat)
  secondHand.geometry.translate(0, 0.3, 0)
  secondHand.position.set(0, 0, 0.22)
  dialGroup.add(secondHand)

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 20), accentMat)
  hub.rotation.x = Math.PI / 2
  hub.position.z = 0.225
  dialGroup.add(hub)

  group.add(dialGroup)

  // ---- back lid (slides backward on open) ----
  const backLid = new THREE.Group()
  backLid.name = 'backLid'
  const caseBack = new THREE.Mesh(new THREE.CircleGeometry(1.15, 72), caseMat)
  caseBack.position.z = -0.2
  caseBack.rotation.y = Math.PI
  backLid.add(caseBack)
  group.add(backLid)

  // ---- movement group placeholder (populated by createMovement) ----
  const movementGroup = new THREE.Group()
  movementGroup.name = 'movementGroup'
  movementGroup.visible = false
  group.add(movementGroup)

  const materials = { caseMat, bezelMat, dialMat, crystalMat, handMat, accentMat }

  function setVariant(indexA, indexB, t) {
    const a = VARIANTS[indexA]
    const b = VARIANTS[((indexB % VARIANTS.length) + VARIANTS.length) % VARIANTS.length]
    tmpColorA.set(a.case)
    tmpColorB.set(b.case)
    caseMat.color.copy(tmpColorA).lerp(tmpColorB, t)
    caseMat.metalness = THREE.MathUtils.lerp(a.caseMetalness, b.caseMetalness, t)
    caseMat.roughness = THREE.MathUtils.lerp(a.caseRoughness, b.caseRoughness, t)

    tmpColorA.set(a.bezel)
    tmpColorB.set(b.bezel)
    bezelMat.color.copy(tmpColorA).lerp(tmpColorB, t)
    bezelMat.metalness = caseMat.metalness
    bezelMat.roughness = Math.max(0.06, caseMat.roughness - 0.1)

    tmpColorA.set(a.dial)
    tmpColorB.set(b.dial)
    dialMat.color.copy(tmpColorA).lerp(tmpColorB, t)

    tmpColorA.set(a.accent)
    tmpColorB.set(b.accent)
    accentMat.color.copy(tmpColorA).lerp(tmpColorB, t)
    accentMat.emissive.copy(accentMat.color)
  }

  function setOpen(factor) {
    frontLid.position.z = factor * 1.6
    dialGroup.position.z = factor * 0.55
    dialGroup.children.forEach((c) => {
      c.material && c.material.transparent !== undefined
    })
    backLid.position.z = -factor * 1.6
    const dialOpacity = THREE.MathUtils.clamp(1 - factor * 1.6, 0, 1)
    dialMat.transparent = true
    dialMat.opacity = dialOpacity
    handMat.transparent = true
    handMat.opacity = dialOpacity
    accentMat.transparent = true
    accentMat.opacity = Math.max(dialOpacity, factor > 0.9 ? 0 : dialOpacity)
    movementGroup.visible = factor > 0.02
  }

  return { group, materials, parts: { caseMesh, frontLid, dialGroup, backLid, movementGroup, hands: { hourHand, minuteHand, secondHand } }, setVariant, setOpen }
}
