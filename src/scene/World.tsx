import {
  Component,
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import type { StoredTower } from '../types'
import { PLOT, ulam, towerHeight } from '../lib/world'
import { buildNpcTowers, type NpcTower } from '../lib/roster'
import { THEMES, shade } from '../lib/themes'
import { useCityStore } from '../store'
import Ground from './Ground'

const WORLD_RADIUS = 170
/** How many spiral plots get citizen buildings. */
const FILLER_PLOTS = 440
/** Always label this many of the tallest citizens. */
const TALLEST_LABELS = 6
/** Also label citizens within this radius of the camera focus. */
const NEAR_LABEL_R = 48
/** Uniform building footprint so the skyline reads as one planned city. */
const FOOTPRINT = 2.8

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

/**
 * THE ONE color rule for every building in World view — real users and NPC
 * citizens alike. Facade = the user's Easy/Med/Hard mix, pulled toward their
 * dominant difficulty; dimmed at night; darkened if inactive. Applied
 * identically everywhere so the whole city reads consistently.
 */
function towerColor(
  t: StoredTower,
  theme: (typeof THEMES)[keyof typeof THEMES],
  night: boolean,
): THREE.Color {
  const total = Math.max(1, t.all)
  const c = new THREE.Color(0, 0, 0)
  c.add(new THREE.Color(theme.easy).multiplyScalar(t.easy / total))
  c.add(new THREE.Color(theme.medium).multiplyScalar(t.medium / total))
  c.add(new THREE.Color(theme.hard).multiplyScalar(t.hard / total))
  const dominant =
    t.hard >= t.medium && t.hard >= t.easy
      ? theme.hard
      : t.medium >= t.easy
        ? theme.medium
        : theme.easy
  c.lerp(new THREE.Color(dominant), 0.45)
  if (night) c.multiplyScalar(0.7)
  if ((t.recent ?? 1) === 0) c.multiplyScalar(0.4) // inactive = dark
  return c
}

/** Small billboarded name label used above buildings. */
function TowerLabel({
  x,
  z,
  y,
  name,
  color,
  bg,
  size = 1.05,
}: {
  x: number
  z: number
  y: number
  name: string
  color: string
  bg: string
  size?: number
}) {
  return (
    <LabelBoundary>
      <Suspense fallback={null}>
        <Billboard position={[x, y, z]}>
          <Text
            font="/fonts/label.ttf"
            fontSize={size}
            color={color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.04}
            outlineColor={bg}
          >
            {name}
          </Text>
        </Billboard>
      </Suspense>
    </LabelBoundary>
  )
}

/**
 * Every free plot is a clickable citizen with a synthetic profile, drawn in one
 * InstancedMesh for performance. Labels show for the tallest few, for anyone
 * near the camera focus, and for whatever building you hover.
 */
function Citizens({
  occupied,
  avoid,
  focus,
}: {
  occupied: Set<number>
  avoid: Array<[number, number]>
  focus: [number, number]
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const setWorldSelection = useCityStore((s) => s.setWorldSelection)
  const theme = THEMES[themeKey]
  const [hover, setHover] = useState<number | null>(null)

  const npcs = useMemo(
    () => buildNpcTowers(occupied, FILLER_PLOTS, avoid, PLOT * 3.6),
    [occupied, avoid],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    npcs.forEach((n, i) => {
      tmpObject.position.set(n.x, n.height / 2, n.z)
      tmpObject.scale.set(FOOTPRINT, n.height, FOOTPRINT)
      tmpObject.rotation.set(0, 0, 0)
      tmpObject.updateMatrix()
      mesh.setMatrixAt(i, tmpObject.matrix)
      // identical color rule as real towers (no extra dimming)
      tmpColor.copy(towerColor(n.tower, theme, night))
      mesh.setColorAt(i, tmpColor)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [npcs, theme, night])

  // Which citizens get a floating label: tallest few ∪ near-focus ∪ hovered.
  const toLabel = useMemo(() => {
    const map = new Map<string, NpcTower>()
    ;[...npcs]
      .sort((a, b) => b.height - a.height)
      .slice(0, TALLEST_LABELS)
      .forEach((n) => map.set(n.tower.username, n))
    const r2 = NEAR_LABEL_R * NEAR_LABEL_R
    for (const n of npcs) {
      if ((n.x - focus[0]) ** 2 + (n.z - focus[1]) ** 2 < r2)
        map.set(n.tower.username, n)
    }
    return [...map.values()]
  }, [npcs, focus])

  const hovered = hover !== null ? npcs[hover] : null

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.instanceId === undefined) return
    setWorldSelection(npcs[e.instanceId].tower)
  }

  return (
    <group>
      <instancedMesh
        key={npcs.length}
        ref={meshRef}
        args={[undefined, undefined, npcs.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
        onClick={onClick}
        onPointerMove={(e) => {
          e.stopPropagation()
          setHover(e.instanceId ?? null)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(null)
          document.body.style.cursor = 'default'
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} metalness={0.28} />
      </instancedMesh>

      {toLabel.map((n) => (
        <TowerLabel
          key={n.tower.username}
          x={n.x}
          z={n.z}
          y={n.height + 2}
          name={n.tower.username}
          color={theme.label}
          bg={theme.bgTop}
        />
      ))}

      {hovered && (
        <TowerLabel
          x={hovered.x}
          z={hovered.z}
          y={hovered.height + 2}
          name={hovered.tower.username}
          color={theme.accent}
          bg={theme.bgTop}
          size={1.25}
        />
      )}
    </group>
  )
}

/** One real (searched) user's tower on their home plot. */
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
  const active = (tower.recent ?? 1) > 0

  // Same shared color rule as citizens — one consistent language.
  const color = useMemo(() => towerColor(tower, theme, night), [tower, theme, night])

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
        <boxGeometry args={[FOOTPRINT, h, FOOTPRINT]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.28} />
      </mesh>
      {/* roof cap */}
      <mesh position={[0, h + 0.35, 0]} castShadow>
        <boxGeometry args={[FOOTPRINT * 0.72, 0.7, FOOTPRINT * 0.72]} />
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
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.06, 0]}
            raycast={() => null}
          >
            <ringGeometry args={[3.2, 4.4, 48]} />
            <meshBasicMaterial color={theme.accent} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, h + 30, 0]} raycast={() => null}>
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

/** Yellow ring on the currently selected building — the one "special" marker. */
function SelectionRing() {
  const sel = useCityStore((s) => s.worldSelection)
  const themeKey = useCityStore((s) => s.theme)
  const theme = THEMES[themeKey]
  if (!sel) return null
  const [px, pz] = ulam(sel.plot)
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[px * PLOT, 0.08, pz * PLOT]}
      raycast={() => null}
    >
      <ringGeometry args={[3.0, 4.2, 48]} />
      <meshBasicMaterial color={theme.accent} transparent opacity={0.9} />
    </mesh>
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
  const worldSelection = useCityStore((s) => s.worldSelection)

  const occupied = useMemo(() => new Set(towers.map((t) => t.plot)), [towers])
  const avoid = useMemo(
    () => towers.map((t) => ulam(t.plot).map((v) => v * PLOT) as [number, number]),
    [towers],
  )

  // Where the camera is looking — used to decide which citizen labels to show.
  const focus = useMemo<[number, number]>(() => {
    const plot =
      worldSelection?.plot ??
      towers.find((t) => t.username.toLowerCase() === currentName.toLowerCase())
        ?.plot
    if (plot === undefined) return [0, 0]
    const [px, pz] = ulam(plot)
    return [px * PLOT, pz * PLOT]
  }, [worldSelection, towers, currentName])

  return (
    <group>
      <Ground radius={WORLD_RADIUS} />
      <Monument />
      <Citizens occupied={occupied} avoid={avoid} focus={focus} />
      <SelectionRing />
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
