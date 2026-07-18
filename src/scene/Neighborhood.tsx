import { Component, Suspense, type ReactNode } from 'react'
import { Text, Billboard } from '@react-three/drei'
import type { Neighborhood as Hood } from '../lib/roster'
import { THEMES } from '../lib/themes'
import { useCityStore } from '../store'
import Buildings from './Buildings'
import Landmark from './Landmark'
import Ground from './Ground'

class LabelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Multiplayer view: renders the current user's city plus several opponents,
 * spaced apart in one shared scene. Composes the existing Buildings/Landmark
 * components at offsets — it does NOT modify them.
 */
export default function Neighborhood({ hood }: { hood: Hood }) {
  const themeKey = useCityStore((s) => s.theme)
  const theme = THEMES[themeKey]

  return (
    <group>
      <Ground radius={hood.radius} />
      {hood.items.map((it, i) => {
        const isLeader = i === hood.leaderIndex
        const isYou = i === 0 // current user is always first in the list
        const labelColor = isLeader ? theme.accent : isYou ? theme.easy : theme.label
        const labelY = it.layout.landmarkHeight
          ? it.layout.landmarkHeight + 8
          : it.maxHeight + 8

        return (
          <group key={it.data.username + i} position={[it.ox, 0, it.oz]}>
            <Buildings layout={it.layout} />
            <Landmark height={it.layout.landmarkHeight} />

            {/* leader crown — geometry (no CDN font/emoji dependency) */}
            {isLeader && (
              <mesh position={[0, labelY + 5.2, 0]} rotation={[0, Math.PI / 4, 0]}>
                <octahedronGeometry args={[1.4]} />
                <meshStandardMaterial
                  color={theme.accent}
                  emissive={theme.accent}
                  emissiveIntensity={1.2}
                />
              </mesh>
            )}

            <LabelBoundary>
              <Suspense fallback={null}>
                <Billboard position={[0, labelY, 0]}>
                  {isLeader && (
                    <Text
                      font="/fonts/label.ttf"
                      fontSize={2.4}
                      color={theme.accent}
                      anchorX="center"
                      anchorY="bottom"
                      position={[0, 3.4, 0]}
                      outlineWidth={0.08}
                      outlineColor={theme.bgTop}
                    >
                      TALLEST TOWER
                    </Text>
                  )}
                  <Text
                    font="/fonts/label.ttf"
                    fontSize={2.6}
                    color={labelColor}
                    anchorX="center"
                    anchorY="bottom"
                    outlineWidth={0.08}
                    outlineColor={theme.bgTop}
                  >
                    {isYou ? `${it.data.username} (YOU)` : it.data.username}
                  </Text>
                  <Text
                    font="/fonts/label.ttf"
                    fontSize={1.5}
                    color={theme.label}
                    anchorX="center"
                    anchorY="top"
                    position={[0, -0.4, 0]}
                    outlineWidth={0.05}
                    outlineColor={theme.bgTop}
                  >
                    {`${it.totalSolved} solved`}
                  </Text>
                </Billboard>
              </Suspense>
            </LabelBoundary>
          </group>
        )
      })}
    </group>
  )
}
