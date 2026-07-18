import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { CityLayout, Difficulty } from '../types'
import { THEMES } from '../lib/themes'
import { useCityStore } from '../store'

const tmpObject = new THREE.Object3D()
const tmpColor = new THREE.Color()
const white = new THREE.Color('#ffffff')

/**
 * MeshStandardMaterial patched with a procedural window grid, computed in
 * world space so windows stay crisp no matter how each instance is scaled.
 * At night the windows light up (driven by the uNight/uGlow uniforms).
 */
function makeWindowMaterial(uniforms: { uNight: { value: number }; uGlow: { value: number } }) {
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.25 })
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uNight = uniforms.uNight
    shader.uniforms.uGlow = uniforms.uGlow

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;\nvarying vec3 vLPos;',
      )
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vLPos = position;
        vec4 lcWp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          lcWp = instanceMatrix * lcWp;
        #endif
        vWPos = (modelMatrix * lcWp).xyz;
        vec3 lcN = normal;
        #ifdef USE_INSTANCING
          lcN = mat3(instanceMatrix) * lcN;
        #endif
        vWNrm = normalize(mat3(modelMatrix) * lcN);`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;\nvarying vec3 vLPos;\nuniform float uNight;\nuniform float uGlow;',
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          // --- material polish (additive): vertical AO + edge highlight ---
          float lcAo = mix(0.72, 1.0, smoothstep(-0.5, 0.35, vLPos.y));
          diffuseColor.rgb *= lcAo;
          vec3 lcA = abs(vLPos);
          float lcEx = step(0.5 - 0.04, lcA.x);
          float lcEy = step(0.5 - 0.025, lcA.y);
          float lcEz = step(0.5 - 0.04, lcA.z);
          float lcEdge = clamp(lcEx * lcEz + lcEx * lcEy + lcEz * lcEy, 0.0, 1.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.4 + vec3(0.03), lcEdge * 0.55);
          float lcH = vWPos.x + vWPos.z;
          float lcWx = fract(lcH / 0.62);
          float lcWy = fract(vWPos.y / 0.78);
          float lcWin = step(0.30, lcWx) * step(lcWx, 0.72)
                      * step(0.30, lcWy) * step(lcWy, 0.74);
          // only on side faces, and not at street level
          lcWin *= 1.0 - step(0.6, abs(vWNrm.y));
          lcWin *= step(0.35, vWPos.y);
          vec2 lcCell = vec2(floor(lcH / 0.62), floor(vWPos.y / 0.78));
          float lcRnd = fract(sin(dot(lcCell, vec2(12.9898, 78.233))) * 43758.5453);
          float lcLit = step(1.0 - (0.25 + uGlow * 0.55), lcRnd);
          vec3 lcWarm = vec3(1.0, 0.82, 0.5);
          // window glass: darker than facade by day, near-black at night unless lit
          vec3 lcGlass = diffuseColor.rgb * mix(0.42, 0.12, uNight);
          diffuseColor.rgb = mix(diffuseColor.rgb, lcGlass, lcWin);
          totalEmissiveRadiance += lcWin * lcLit * uNight * lcWarm * 2.4;
        }`,
      )
  }
  return mat
}

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

  const avgGlow = useMemo(
    () =>
      buildings.length
        ? buildings.reduce((s, b) => s + b.glow, 0) / buildings.length
        : 0,
    [buildings],
  )

  const uniforms = useMemo(
    () => ({ uNight: { value: 0 }, uGlow: { value: 0.5 } }),
    [],
  )
  const material = useMemo(() => makeWindowMaterial(uniforms), [uniforms])

  // Smoothly fade windows on/off when night toggles.
  useFrame(() => {
    const target = night ? 1 : 0
    uniforms.uNight.value += (target - uniforms.uNight.value) * 0.08
    uniforms.uGlow.value = 0.2 + avgGlow * 0.8
  })

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
        tmpColor.multiplyScalar(0.5)
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
      material={material}
      frustumCulled={false} // guard: tall instanced buildings must never cull out
      castShadow
      receiveShadow
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}
