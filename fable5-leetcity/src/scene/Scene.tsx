import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { CityData } from '../types'
import { buildCityLayout } from '../lib/cityLayout'
import { THEMES, shade } from '../lib/themes'
import { useCityStore } from '../store'
import City from './City'

/** Re-frames the camera whenever a new city is generated. */
function CameraRig({ radius }: { radius: number }) {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    const d = Math.max(30, radius * 1.45)
    camera.position.set(d, d * 0.72, d)
    camera.lookAt(0, 4, 0)
    camera.updateProjectionMatrix()
  }, [camera, radius])
  return null
}

export default function Scene({ data }: { data: CityData }) {
  const layout = useMemo(() => buildCityLayout(data), [data])
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const setSelection = useCityStore((s) => s.setSelection)
  const theme = THEMES[themeKey]

  const dim = night ? 0.35 : 1
  const bgTop = shade(theme.bgTop, dim)
  const bgBottom = shade(theme.bgBottom, dim)
  const far = Math.max(600, layout.cityRadius * 10)

  return (
    <Canvas
      shadows
      // preserveDrawingBuffer lets the Share button read pixels back out.
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [60, 44, 60], fov: 42, near: 0.1, far }}
      style={{ background: `linear-gradient(${bgTop} 0%, ${bgBottom} 100%)` }}
      onPointerMissed={() => setSelection(null)}
    >
      <fog
        attach="fog"
        args={[bgTop, layout.cityRadius * 2.2, layout.cityRadius * 6]}
      />

      <hemisphereLight
        args={night ? ['#2a3660', '#05070c', 0.5] : ['#5a6b9e', '#12151c', 0.7]}
      />
      <ambientLight intensity={night ? 0.18 : 0.25} />
      <directionalLight
        position={night ? [-30, 50, -20] : [45, 60, 25]}
        intensity={night ? 0.35 : 1.6}
        color={night ? '#8fa3d9' : '#ffffff'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />

      <CameraRig radius={layout.cityRadius} />
      <City layout={layout} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.55}
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={12}
        maxDistance={Math.max(180, layout.cityRadius * 4)}
        target={[0, 4, 0]}
      />
    </Canvas>
  )
}
