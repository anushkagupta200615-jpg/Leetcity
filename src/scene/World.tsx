import { Component, Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import type { StoredTower } from '../types'
import { PLOT, RESERVED, ulam, towerHeight } from '../lib/world'
import { mulberry32 } from '../lib/seed'
import { THEMES, shade } from '../lib/themes'
import { useCityStore } from '../store'
import Ground from './Ground'

const WORLD_RADIUS = 170
/** How many spiral plots get procedural "citizen" filler buildings. */
const FILLER_PLOTS = 440

class LabelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const tmpObject = new THREE.Object3D()
const tmpColor = new THREE.Color()

/** Dim procedural buildings that make the world feel inhabited. */
function Citizens({ occupied }: { occupied: Set<number> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const theme = THEMES[themeKey]

  const blocks = useMemo(() => {
    const out: Array<{ x: number; z: number; w: number; h: number; d: number; tint: number }> = []
    for (let i = RESERVED; i < RESERVED + FILLER_PLOTS; i++) {
      if (occupied.has(i)) continue
      const rand = mulberry32(i * 2654435761)
      if (rand() < 0.42) continue // leave empty lots
      const [px, pz] = ulam(i)
      const cx = px * PLOT
      const cz = pz * PLOT
      const count = 1 + Math.floor(rand() * 3)
      for (let b = 0; b < count; b++) {
        out.push({
          x: cx + (rand() - 0.5) * (PLOT * 0.5),
          z: cz + (rand() - 0.5) * (PLOT * 0.5),
          w: 1.2 + rand() * 1.8,
          h: 1 + rand() * 4.5,
          d: 1.2 + rand() * 1.8,
          tint: 0.75 + rand() * 0.5,
        })
      }
    }
    return out
  }, [occupied])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const base = new THREE.Color(shade(theme.grid2, night ? 0.8 : 1.5))
    blocks.forEach((b, i) => {
      tmpObject.position.set(b.x, b.h / 2, b.z)
      tmpObject.scale.set(b.w, b.h, b.d)
      tmpObject.rotation.set(0, 0, 0)
      tmpObject.updateMatrix()
      mesh.setMatrixAt(i, tmpObject.matrix)
      tmpColor.copy(base).multiplyScalar(b.tint)
      mesh.setColorAt(i, tmpColor)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [blocks, theme, night])

  return (
    <instancedMesh
      key={blocks.length}
      ref={meshRef}
      args={[undefined, undefined, blocks.length]}
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.85} metalness={0.1} />
    </instancedMesh>
  )
}

/** One user's tower on their home plot. */
function Tower({ tower, isCurrent }: { tower: StoredTower; isCurrent: boolean }) {
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const setWorldSelection = useCityStore((s) => s.setWorldSelection)
  const theme = THEMES[themeKey]
  const beaconRef = useRef<THREE.Mesh>(null)

  const [px, pz] = ulam(tower.plot)
  const x = px * PLOT
  const z = pz * PLOT
  const h = towerHeight(tower)
  // Recency: towers of inactive users go dark (legacy entries stay lit).
  const active = (tower.recent ?? 1) > 0

  // Facade color = difficulty mix, pulled toward the dominant difficulty
  // so towers don't all blur into the same olive tone.
  const color = useMemo(() => {
    const total = Math.max(1, tower.all)
    const c = new THREE.Color(0, 0, 0)
    c.add(new THREE.Color(theme.easy).multiplyScalar(tower.easy / total))
    c.add(new THREE.Color(theme.medium).multiplyScalar(tower.medium / total))
    c.add(new THREE.Color(theme.hard).multiplyScalar(tower.hard / total))
    const dominant =
      tower.hard >= tower.medium && tower.hard >= tower.easy
        ? theme.hard
        : tower.medium >= tower.easy
          ? theme.medium
          : theme.easy
    c.lerp(new THREE.Color(dominant), 0.45)
    if (night) c.multiplyScalar(0.7)
    if ((tower.recent ?? 1) === 0) c.multiplyScalar(0.35) // inactive = dark
    return c
  }, [tower, theme, night])

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.6 + Math.sin(clock.elapsedTime * 2.2 + tower.plot) * 0.7
    }
  })

  return (
    <group position={[x, 0, z]}>
      <mesh
        position={[0, h / 2, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          setWorldSelection(tower)
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <boxGeometry args={[3.4, h, 3.4]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.3} />
      </mesh>
      {/* roof cap */}
      <mesh position={[0, h + 0.35, 0]} castShadow>
        <boxGeometry args={[2.4, 0.7, 2.4]} />
        <meshStandardMaterial color={shade('#8a93a8', night ? 0.6 : 1)} roughness={0.5} />
      </mesh>
      {/* contest beacon (dark for inactive users) */}
      {tower.rating > 0 && active && (
        <mesh ref={beaconRef} position={[0, h + 1.4, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={theme.accent}
            emissive={theme.accent}
            emissiveIntensity={1.6}
          />
        </mesh>
      )}
      {/* "you are here": ring + sky spotlight beam */}
      {isCurrent && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
            <ringGeometry args={[3.2, 4.4, 48]} />
            <meshBasicMaterial color={theme.accent} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, h + 30, 0]}>
            <cylinderGeometry args={[7.5, 2.6, 60, 24, 1, true]} />
            <meshBasicMaterial
              color={theme.accent}
              transparent
              opacity={0.09}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
      <LabelBoundary>
        <Suspense fallback={null}>
          <Billboard position={[0, h + (tower.rating > 0 ? 3.2 : 2.2), 0]}>
            <Text
              font="/fonts/label.ttf"
              fontSize={isCurrent ? 1.6 : 1.15}
              color={isCurrent ? theme.accent : theme.label}
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.05}
              outlineColor={theme.bgTop}
            >
              {tower.username}
            </Text>
            <Text
              font="/fonts/label.ttf"
              fontSize={0.85}
              color={theme.label}
              anchorX="center"
              anchorY="top"
              position={[0, -0.15, 0]}
              outlineWidth={0.04}
              outlineColor={theme.bgTop}
            >
              {`${tower.all} solved${tower.rating ? ` · ${tower.rating}` : ''}`}
            </Text>
          </Billboard>
        </Suspense>
      </LabelBoundary>
    </group>
  )
}

/** Central monument marking the world origin. */
function Monument() {
  const themeKey = useCityStore((s) => s.theme)
  const theme = THEMES[themeKey]
  return (
    <group>
      <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[5, 6, 0.8, 8]} />
        <meshStandardMaterial color="#2a2f3e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 5.4, 0]} castShadow>
        <cylinderGeometry args={[0.7, 1.6, 10, 4]} />
        <meshStandardMaterial color="#4d5a72" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 11.2, 0]}>
        <octahedronGeometry args={[1]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={0.9}
        />
      </mesh>
    </group>
  )
}

export default function World() {
  const towers = useCityStore((s) => s.towers)
  const currentName = useCityStore((s) => s.data?.username ?? '')

  const occupied = useMemo(() => new Set(towers.map((t) => t.plot)), [towers])

  return (
    <group>
      <Ground radius={WORLD_RADIUS} />
      <Monument />
      <Citizens occupied={occupied} />
      {towers.map((t) => (
        <Tower
          key={t.username}
          tower={t}
          isCurrent={t.username.toLowerCase() === currentName.toLowerCase()}
        />
      ))}
    </group>
  )
}
