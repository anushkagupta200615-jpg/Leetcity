import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { CityLayout, Difficulty } from '../types'

// LeetCode's difficulty palette.
const DIFF_COLOR: Record<Difficulty, THREE.Color> = {
  easy: new THREE.Color('#00b8a3'),
  medium: new THREE.Color('#ffc01e'),
  hard: new THREE.Color('#ff375f'),
}

const tmpObject = new THREE.Object3D()
const tmpColor = new THREE.Color()

export default function Buildings({ layout }: { layout: CityLayout }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const buildings = useMemo(
    () => layout.districts.flatMap((d) => d.buildings),
    [layout],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    buildings.forEach((b, i) => {
      tmpObject.position.set(b.x, b.height / 2, b.z)
      tmpObject.scale.set(b.width, b.height, b.depth)
      tmpObject.rotation.set(0, 0, 0)
      tmpObject.updateMatrix()
      mesh.setMatrixAt(i, tmpObject.matrix)

      // Base color by difficulty, brightened by recent-activity glow.
      tmpColor.copy(DIFF_COLOR[b.difficulty])
      tmpColor.lerp(new THREE.Color('#ffffff'), b.glow * 0.25)
      mesh.setColorAt(i, tmpColor)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [buildings])

  return (
    <instancedMesh
      key={buildings.length} // re-mount when count changes
      ref={meshRef}
      args={[undefined, undefined, buildings.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.55} metalness={0.25} />
    </instancedMesh>
  )
}
