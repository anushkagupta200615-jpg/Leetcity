import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { CityLayout, Difficulty } from '../types'
import { THEMES } from '../lib/themes'
import { useCityStore } from '../store'

const tmpObject = new THREE.Object3D()
const tmpColor = new THREE.Color()
const white = new THREE.Color('#ffffff')
const windowLight = new THREE.Color('#ffe9a3')

export default function Buildings({ layout }: { layout: CityLayout }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const setSelection = useCityStore((s) => s.setSelection)
  const theme = THEMES[themeKey]

  const buildings = useMemo(
    () => layout.districts.flatMap((d) => d.buildings),
    [layout],
  )

  /** cumulative start index of each district, for instanceId -> district lookup */
  const districtStarts = useMemo(() => {
    const starts: number[] = []
    let acc = 0
    for (const d of layout.districts) {
      starts.push(acc)
      acc += d.buildings.length
    }
    return starts
  }, [layout])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const diffColor: Record<Difficulty, THREE.Color> = {
      easy: new THREE.Color(theme.easy),
      medium: new THREE.Color(theme.medium),
      hard: new THREE.Color(theme.hard),
    }
    buildings.forEach((b, i) => {
      tmpObject.position.set(b.x, b.height / 2, b.z)
      tmpObject.scale.set(b.width, b.height, b.depth)
      tmpObject.rotation.set(0, 0, 0)
      tmpObject.updateMatrix()
      mesh.setMatrixAt(i, tmpObject.matrix)

      tmpColor.copy(diffColor[b.difficulty])
      if (night) {
        // Dim the facade, then warm it up where windows are lit.
        tmpColor.multiplyScalar(0.55).lerp(windowLight, b.glow * 0.75)
      } else {
        tmpColor.lerp(white, b.glow * 0.25)
      }
      mesh.setColorAt(i, tmpColor)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [buildings, theme, night])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.instanceId === undefined) return
    let idx = layout.districts.length - 1
    while (idx > 0 && districtStarts[idx] > e.instanceId) idx--
    const district = layout.districts[idx]
    const building = buildings[e.instanceId]
    setSelection({
      label: district.label,
      level: district.level,
      solved: district.solved,
      difficulty: building.difficulty,
    })
  }

  return (
    <instancedMesh
      key={buildings.length} // re-mount when count changes
      ref={meshRef}
      args={[undefined, undefined, buildings.length]}
      castShadow
      receiveShadow
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.55} metalness={0.25} />
    </instancedMesh>
  )
}
