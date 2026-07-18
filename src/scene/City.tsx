import { Component, Suspense, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import type { CityLayout, TagLevel } from '../types'
import { THEMES } from '../lib/themes'
import { useCityStore } from '../store'
import Buildings from './Buildings'
import Landmark from './Landmark'
import Ground from './Ground'
import Character from './Character'

/** If labels fail (e.g. font can't load), drop them instead of killing the scene. */
class LabelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function DistrictLabels({ layout }: { layout: CityLayout }) {
  const themeKey = useCityStore((s) => s.theme)
  const theme = THEMES[themeKey]
  return (
    <>
      {layout.districts.map((d) => (
        <Billboard key={d.tag} position={[d.cx, 0.4, d.cz + d.half + 1.2]}>
          <Text
            font="/fonts/label.ttf"
            fontSize={1.05}
            color={theme.label}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.04}
            outlineColor={theme.bgTop}
            maxWidth={d.half * 2 + 6}
            textAlign="center"
          >
            {`${d.label} · ${d.solved}`}
          </Text>
        </Billboard>
      ))}
    </>
  )
}

/** Subtle tinted floor tile under each district cluster (visual layer only). */
function DistrictPads({ layout }: { layout: CityLayout }) {
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const theme = THEMES[themeKey]
  const levelColor: Record<TagLevel, string> = {
    fundamental: theme.easy,
    intermediate: theme.medium,
    advanced: theme.hard,
  }
  return (
    <>
      {layout.districts.map((d) => (
        <mesh
          key={d.tag}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[d.cx, 0.012, d.cz]}
        >
          <planeGeometry args={[d.half * 2 + 1.4, d.half * 2 + 1.4]} />
          <meshBasicMaterial
            color={levelColor[d.level]}
            transparent
            opacity={night ? 0.05 : 0.09}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

/** Vacant lots marking core topics with zero solves — the gap you should fill. */
function GapLots({ layout }: { layout: CityLayout }) {
  const themeKey = useCityStore((s) => s.theme)
  const setSelection = useCityStore((s) => s.setSelection)
  const theme = THEMES[themeKey]

  // One shared border material, pulsed each frame (enhancement only —
  // geometry, function, and click behavior of the lots are unchanged).
  const borderMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: theme.hard,
        transparent: true,
        opacity: 0.5,
      }),
    [theme],
  )
  useFrame(({ clock }) => {
    borderMat.opacity = 0.38 + Math.sin(clock.elapsedTime * 2.4) * 0.22
  })

  return (
    <>
      {layout.gaps.map((g) => {
        const size = g.half * 2
        const edge = 0.14
        return (
          <group key={g.tag} position={[g.cx, 0, g.cz]}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.02, 0]}
              onClick={(e) => {
                e.stopPropagation()
                setSelection({
                  label: g.label,
                  level: 'fundamental',
                  solved: g.solved,
                  difficulty: 'hard',
                  gap: true,
                  tagSlug: g.tag,
                })
              }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'default')}
            >
              <planeGeometry args={[size, size]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.42} />
            </mesh>
            {/* hazard border */}
            {[
              [0, g.half],
              [0, -g.half],
              [g.half, 0],
              [-g.half, 0],
            ].map(([ex, ez], i) => (
              <mesh
                key={i}
                position={[ex, 0.09, ez]}
                rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]}
                material={borderMat}
              >
                <boxGeometry args={[size + edge, 0.16, edge]} />
              </mesh>
            ))}
            <LabelBoundary>
              <Suspense fallback={null}>
                <Billboard position={[0, 1.1, 0]}>
                  <Text
                    font="/fonts/label.ttf"
                    fontSize={0.78}
                    color={theme.hard}
                    anchorX="center"
                    anchorY="bottom"
                    outlineWidth={0.04}
                    outlineColor={theme.bgTop}
                    maxWidth={size + 4}
                    textAlign="center"
                  >
                    {`${g.label}\nEMPTY LOT`}
                  </Text>
                </Billboard>
              </Suspense>
            </LabelBoundary>
          </group>
        )
      })}
    </>
  )
}

export default function City({ layout }: { layout: CityLayout }) {
  const walk = useCityStore((s) => s.walk)
  return (
    <group>
      <Ground radius={layout.cityRadius} />
      <DistrictPads layout={layout} />
      <Buildings layout={layout} />
      <Landmark height={layout.landmarkHeight} />
      <GapLots layout={layout} />
      {walk && <Character layout={layout} />}
      <LabelBoundary>
        <Suspense fallback={null}>
          <DistrictLabels layout={layout} />
        </Suspense>
      </LabelBoundary>
    </group>
  )
}
