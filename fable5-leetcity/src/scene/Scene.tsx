import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { CityData } from '../types'
import { buildCityLayout } from '../lib/cityLayout'
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
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const far = Math.max(600, layout.cityRadius * 10)

  return (
    <Canvas
      shadows
      // preserveDrawingBuffer lets the Share button read pixels back out.
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [60, 44, 60], fov: 42, near: 0.1, far }}
      style={{ background: 'linear-gradient(#0b0d12 0%, #131826 100%)' }}
    >
      <fog
        attach="fog"
        args={['#0b0d12', layout.cityRadius * 2.2, layout.cityRadius * 6]}
      />

      <hemisphereLight args={['#5a6b9e', '#12151c', 0.7]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[45, 60, 25]}
        intensity={1.6}
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
        ref={controlsRef}
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
