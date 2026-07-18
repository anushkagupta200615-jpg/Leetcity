import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { THEMES } from '../lib/themes'
import { useCityStore } from '../store'

/** Central spire whose height reflects contest rating. */
export default function Landmark({ height }: { height: number }) {
  const beaconRef = useRef<THREE.Mesh>(null)
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const accent = THEMES[themeKey].accent

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial
      const base = night ? 2.2 : 1.4
      mat.emissiveIntensity = base + Math.sin(clock.elapsedTime * 2.4) * 0.8
    }
  })

  if (height <= 0) return null

  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.4, 4.2, 1, 6]} />
        <meshStandardMaterial color="#2a2f3e" roughness={0.7} />
      </mesh>
      {/* main tower */}
      <mesh position={[0, height / 2 + 1, 0]} castShadow>
        <meshStandardMaterial
          color="#5a6a85"
          roughness={0.35}
          metalness={0.45}
        />
        <cylinderGeometry args={[1.1, 2.2, height, 6]} />
      </mesh>
      {/* spire */}
      <mesh position={[0, height + 2.4, 0]} castShadow>
        <coneGeometry args={[0.9, 3.2, 6]} />
        <meshStandardMaterial color="#556074" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* beacon */}
      <mesh ref={beaconRef} position={[0, height + 4.4, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.4}
        />
      </mesh>
      <pointLight
        position={[0, height + 4.4, 0]}
        color={accent}
        intensity={night ? 90 : 40}
        distance={night ? 45 : 30}
      />
    </group>
  )
}
