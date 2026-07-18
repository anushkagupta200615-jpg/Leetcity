import { Component, Suspense, type ReactNode } from 'react'
import { Text, Billboard } from '@react-three/drei'
import type { CityLayout } from '../types'
import Buildings from './Buildings'
import Landmark from './Landmark'
import Ground from './Ground'

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
  return (
    <>
      {layout.districts.map((d) => (
        <Billboard key={d.tag} position={[d.cx, 0.4, d.cz + d.half + 1.2]}>
          <Text
            font="/fonts/label.ttf"
            fontSize={1.05}
            color="#8b95ab"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.04}
            outlineColor="#0b0d12"
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

export default function City({ layout }: { layout: CityLayout }) {
  return (
    <group>
      <Ground radius={layout.cityRadius} />
      <Buildings layout={layout} />
      <Landmark height={layout.landmarkHeight} />
      <LabelBoundary>
        <Suspense fallback={null}>
          <DistrictLabels layout={layout} />
        </Suspense>
      </LabelBoundary>
    </group>
  )
}
