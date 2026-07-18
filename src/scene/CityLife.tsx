import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { rngFor } from '../lib/seed'

/** A traffic-light post that cycles green -> amber -> red. */
function TrafficLight({ x, z, offset }: { x: number; z: number; offset: number }) {
  const g = useRef<THREE.MeshStandardMaterial>(null)
  const a = useRef<THREE.MeshStandardMaterial>(null)
  const r = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const phase = Math.floor((clock.elapsedTime * 0.35 + offset) % 3)
    if (g.current) g.current.emissiveIntensity = phase === 0 ? 3 : 0.05
    if (a.current) a.current.emissiveIntensity = phase === 1 ? 3 : 0.05
    if (r.current) r.current.emissiveIntensity = phase === 2 ? 3 : 0.05
  })

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.2, 6]} />
        <meshStandardMaterial color="#1b2233" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <boxGeometry args={[0.26, 0.66, 0.24]} />
        <meshStandardMaterial color="#0d1220" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.5, 0.14]}>
        <circleGeometry args={[0.07, 12]} />
        <meshStandardMaterial ref={r} color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[0, 2.3, 0.14]}>
        <circleGeometry args={[0.07, 12]} />
        <meshStandardMaterial ref={a} color="#ffb02e" emissive="#ffb02e" emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[0, 2.1, 0.14]}>
        <circleGeometry args={[0.07, 12]} />
        <meshStandardMaterial ref={g} color="#39e07a" emissive="#39e07a" emissiveIntensity={0.05} />
      </mesh>
    </group>
  )
}

export default function CityLife({ radius }: { radius: number }) {
  const lights = useMemo(() => {
    const rnd = rngFor('lights', String(radius))
    const n = Math.min(5, Math.max(3, Math.round(radius / 8)))
    return Array.from({ length: n }, () => ({
      x: (rnd() * 2 - 1) * radius * 0.6,
      z: (rnd() * 2 - 1) * radius * 0.6,
      offset: rnd() * 3,
    }))
  }, [radius])

  return (
    <group>
      {lights.map((l, i) => (
        <TrafficLight key={i} x={l.x} z={l.z} offset={l.offset} />
      ))}
    </group>
  )
}
