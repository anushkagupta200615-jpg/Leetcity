import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { CityLayout, Selection } from '../types'
import { THEMES } from '../lib/themes'
import { useCityStore } from '../store'
import { walk as walkState } from '../lib/walkControls'

/** Physical key -> movement intent. WASD and the arrow keys both work. */
const KEYMAP: Record<string, 'f' | 'b' | 'l' | 'r'> = {
  KeyW: 'f',
  ArrowUp: 'f',
  KeyS: 'b',
  ArrowDown: 'b',
  KeyA: 'l',
  ArrowLeft: 'l',
  KeyD: 'r',
  ArrowRight: 'r',
}

const tmpDesired = new THREE.Vector3()
const tmpLook = new THREE.Vector3()

export default function Character({ layout }: { layout: CityLayout }) {
  const camera = useThree((s) => s.camera)
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const firstPerson = useCityStore((s) => s.firstPerson)
  const setSelection = useCityStore((s) => s.setSelection)
  const setNearBuilding = useCityStore((s) => s.setNearBuilding)
  const setInterior = useCityStore((s) => s.setInterior)
  const theme = THEMES[themeKey]

  const groupRef = useRef<THREE.Group>(null)
  const legL = useRef<THREE.Mesh>(null)
  const legR = useRef<THREE.Mesh>(null)
  const keys = useRef({ f: false, b: false, l: false, r: false })
  const pos = useRef(
    new THREE.Vector3(0, 0, Math.min(18, layout.cityRadius * 0.55)),
  )
  const heading = useRef(Math.PI)
  const camHeading = useRef(Math.PI)
  const tRef = useRef(0)
  const lastVisit = useRef(-1)
  /** the district Selection for the building we're standing next to, if any */
  const nearRef = useRef<Selection | null>(null)

  const { buildings, districtStarts } = useMemo(() => {
    const b = layout.districts.flatMap((d) => d.buildings)
    const starts: number[] = []
    let acc = 0
    for (const d of layout.districts) {
      starts.push(acc)
      acc += d.buildings.length
    }
    return { buildings: b, districtStarts: starts }
  }, [layout])

  // Publish building footprints + radius to the mini-map, once.
  useEffect(() => {
    walkState.active = true
    walkState.radius = layout.cityRadius
    walkState.buildings = buildings.map((b) => ({ x: b.x, z: b.z, d: b.difficulty }))
    return () => {
      walkState.active = false
      walkState.joyX = 0
      walkState.joyZ = 0
      walkState.enterPressed = false
      setNearBuilding(null)
    }
  }, [buildings, layout.cityRadius, setNearBuilding])

  const openInterior = useRef(() => {
    if (nearRef.current) setInterior(nearRef.current)
  })

  // Keyboard listeners (ignored while typing in the search box).
  useEffect(() => {
    const isTyping = () => {
      const tag = document.activeElement?.tagName
      return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA'
    }
    const down = (e: KeyboardEvent) => {
      if (isTyping()) return
      if (e.code === 'KeyE' || e.code === 'Enter') {
        openInterior.current()
        return
      }
      const k = KEYMAP[e.code]
      if (!k) return
      keys.current[k] = true
      if (e.code.startsWith('Arrow')) e.preventDefault()
    }
    const up = (e: KeyboardEvent) => {
      const k = KEYMAP[e.code]
      if (k) keys.current[k] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const speed = Math.max(11, layout.cityRadius * 0.5)
  const maxR = Math.max(6, layout.cityRadius - 1)
  const camOffset = useMemo(() => {
    const d = Math.max(17, layout.cityRadius * 0.8)
    return new THREE.Vector3(d * 0.1, d * 0.82, d)
  }, [layout])

  useFrame((_, rawDt) => {
    const g = groupRef.current
    if (!g) return
    const dt = Math.min(rawDt, 0.05)
    tRef.current += dt
    const k = keys.current

    // keyboard + on-screen joystick, clamped to a unit disc
    let mx = (k.r ? 1 : 0) - (k.l ? 1 : 0) + walkState.joyX
    let mz = (k.b ? 1 : 0) - (k.f ? 1 : 0) + walkState.joyZ
    let mag = Math.hypot(mx, mz)
    const moving = mag > 0.08
    if (moving) {
      if (mag > 1) {
        mx /= mag
        mz /= mag
        mag = 1
      }
      pos.current.x += mx * speed * dt
      pos.current.z += mz * speed * dt
      const r = Math.hypot(pos.current.x, pos.current.z)
      if (r > maxR) {
        pos.current.x *= maxR / r
        pos.current.z *= maxR / r
      }
      heading.current = Math.atan2(mx, -mz)
    }

    // mobile "Enter" button
    if (walkState.enterPressed) {
      walkState.enterPressed = false
      openInterior.current()
    }

    const bob = moving ? Math.abs(Math.sin(tRef.current * 9)) * 0.14 : 0
    g.position.set(pos.current.x, bob, pos.current.z)
    g.rotation.y = heading.current

    const swing = moving ? Math.sin(tRef.current * 9) * 0.6 : 0
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing

    // telemetry for the mini-map
    walkState.x = pos.current.x
    walkState.z = pos.current.z
    walkState.heading = heading.current

    // camera: first-person eye vs. trailing third-person
    if (firstPerson) {
      // smooth the look direction so quick turns don't whip the view
      let dh = heading.current - camHeading.current
      dh = Math.atan2(Math.sin(dh), Math.cos(dh))
      camHeading.current += dh * 0.15
      const fx = Math.sin(camHeading.current)
      const fz = -Math.cos(camHeading.current)
      tmpDesired.set(
        pos.current.x - fx * 0.2,
        1.55 + bob,
        pos.current.z - fz * 0.2,
      )
      camera.position.lerp(tmpDesired, 0.4)
      tmpLook.set(pos.current.x + fx * 12, 1.4, pos.current.z + fz * 12)
      camera.lookAt(tmpLook)
    } else {
      tmpDesired.set(
        pos.current.x + camOffset.x,
        camOffset.y,
        pos.current.z + camOffset.z,
      )
      camera.position.lerp(tmpDesired, 0.12)
      camera.lookAt(pos.current.x, 1.4, pos.current.z)
    }

    // nearest building -> visit card + enter prompt
    let best = -1
    let bestD = Infinity
    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i]
      const dx = b.x - pos.current.x
      const dz = b.z - pos.current.z
      const d = dx * dx + dz * dz
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    const b = best >= 0 ? buildings[best] : null
    const visitR = b ? Math.max(b.width, b.depth) * 0.5 + 2.8 : 0
    if (b && Math.sqrt(bestD) <= visitR) {
      if (best !== lastVisit.current) {
        lastVisit.current = best
        let idx = layout.districts.length - 1
        while (idx > 0 && districtStarts[idx] > best) idx--
        const district = layout.districts[idx]
        const sel: Selection = {
          label: district.label,
          level: district.level,
          solved: district.solved,
          difficulty: b.difficulty,
          tagSlug: district.tag,
        }
        nearRef.current = sel
        setSelection(sel)
        setNearBuilding(sel)
      }
    } else if (lastVisit.current !== -1) {
      lastVisit.current = -1
      nearRef.current = null
      setSelection(null)
      setNearBuilding(null)
    }
  })

  const glow = theme.accent
  const bodyColor = '#eef2ff'
  const limbColor = '#222a40'
  const emis = night ? 1.5 : 0.5

  return (
    <group ref={groupRef} visible={!firstPerson}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.75, 28]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={night ? 0.32 : 0.2}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={legL} position={[-0.16, 0.34, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.2]} />
        <meshStandardMaterial color={limbColor} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh ref={legR} position={[0.16, 0.34, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.2]} />
        <meshStandardMaterial color={limbColor} roughness={0.6} metalness={0.2} />
      </mesh>

      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.5, 0.62, 0.34]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={glow}
          emissiveIntensity={emis * 0.5}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[0, 1.42, 0]} castShadow>
        <boxGeometry args={[0.36, 0.36, 0.36]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={glow}
          emissiveIntensity={emis * 0.3}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[0, 1.44, 0.19]}>
        <boxGeometry args={[0.28, 0.1, 0.04]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={2.6} />
      </mesh>

      <pointLight
        position={[0, 1.5, 0]}
        color={glow}
        intensity={night ? 14 : 4}
        distance={10}
        decay={1.8}
      />
    </group>
  )
}
