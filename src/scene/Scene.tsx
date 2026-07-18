import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import type { CityData } from '../types'
import { buildCityLayout } from '../lib/cityLayout'
import { THEMES, shade } from '../lib/themes'
import { towerPosition, plotToPosition } from '../lib/world'
import { buildNeighborhood } from '../lib/roster'
import { useCityStore } from '../store'
import City from './City'
import World from './World'
import Neighborhood from './Neighborhood'

/** Re-frames the camera when the view or the loaded user changes. */
function CameraRig({
  target,
  distance,
}: {
  target: [number, number, number]
  distance: number
}) {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    camera.position.set(
      target[0] + distance,
      distance * 0.72,
      target[2] + distance,
    )
    camera.lookAt(target[0], target[1], target[2])
    camera.updateProjectionMatrix()
  }, [camera, target[0], target[1], target[2], distance])
  return null
}

export default function Scene({ data }: { data: CityData }) {
  const layout = useMemo(() => buildCityLayout(data), [data])
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const mode = useCityStore((s) => s.mode)
  const walk = useCityStore((s) => s.walk)
  const roster = useCityStore((s) => s.roster)
  const worldSelection = useCityStore((s) => s.worldSelection)
  const setSelection = useCityStore((s) => s.setSelection)
  const setWorldSelection = useCityStore((s) => s.setWorldSelection)
  const theme = THEMES[themeKey]

  const isMulti = mode === 'multi'
  const hood = useMemo(
    () => (isMulti ? buildNeighborhood([data, ...roster]) : null),
    [isMulti, data, roster],
  )

  const dim = night ? 0.35 : 1
  const bgTop = shade(theme.bgTop, dim)
  const bgBottom = shade(theme.bgBottom, dim)

  const isWorld = mode === 'world'
  // In world mode, focus whichever tower is selected — click yours, yours fills
  // the view; click someone else's, theirs does. Default: your own tower.
  const [tx, tz] = isWorld
    ? worldSelection
      ? plotToPosition(worldSelection.plot)
      : towerPosition(data.username)
    : [0, 0]
  const target: [number, number, number] = isWorld ? [tx, 10, tz] : [0, 4, 0]
  const camDistance = isWorld
    ? worldSelection
      ? 32 // zoom in on the selected tower
      : 72 // default: a skyline view of the whole city, your tower centered
    : isMulti && hood
      ? hood.radius * 1.05
      : Math.max(30, layout.cityRadius * 1.45)
  const fogRadius = isWorld ? 300 : isMulti && hood ? hood.radius : layout.cityRadius
  const far = Math.max(1200, fogRadius * 10)
  // Fog: hug the actual world so distant buildings fade into depth (City/Versus
  // keep their existing city-sized fog untouched).
  const fogNear = isWorld ? 60 : fogRadius * 1.6
  const fogFar = isWorld ? 240 : fogRadius * 5

  return (
    <Canvas
      shadows
      // preserveDrawingBuffer lets the Share button read pixels back out.
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [60, 44, 60], fov: 42, near: 0.1, far }}
      style={{ background: `linear-gradient(${bgTop} 0%, ${bgBottom} 100%)` }}
      onPointerMissed={() => {
        setSelection(null)
        setWorldSelection(null)
      }}
    >
      <fog attach="fog" args={[bgTop, fogNear, fogFar]} />

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
      {/* warm accent fill, layered on top of the existing rig */}
      <pointLight
        position={[-38, 26, -38]}
        color="#ff9a3c"
        intensity={night ? 260 : 120}
        distance={190}
        decay={1.6}
      />

      {night && (
        <Stars
          radius={fogRadius * 2.5}
          depth={80}
          count={2400}
          factor={6}
          saturation={0}
          fade
          speed={0.6}
        />
      )}

      <CameraRig target={target} distance={camDistance} />
      {isMulti && hood ? (
        <Neighborhood hood={hood} />
      ) : isWorld ? (
        <World />
      ) : (
        <City layout={layout} />
      )}

      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={night ? 1.1 : 0.55}
          luminanceThreshold={1.0}
          levels={7}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.62} />
      </EffectComposer>

      {/* Walk mode hands the camera to the character's follow-cam, so
          OrbitControls must not be mounted (its per-frame update would fight it). */}
      {!walk && (
        <OrbitControls
          autoRotate={!isWorld && !isMulti}
          autoRotateSpeed={0.55}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={8}
          maxDistance={
            isWorld
              ? 700
              : isMulti && hood
                ? hood.radius * 3
                : Math.max(180, layout.cityRadius * 4)
          }
          target={target}
        />
      )}
    </Canvas>
  )
}
