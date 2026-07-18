import { Grid } from '@react-three/drei'
import { THEMES, shade } from '../lib/themes'
import { useCityStore } from '../store'

export default function Ground({ radius }: { radius: number }) {
  const themeKey = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const theme = THEMES[themeKey]
  const dim = night ? 0.4 : 1
  const size = Math.max(80, radius * 2.6)

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={shade(theme.ground, dim)} roughness={1} />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={[size, size]}
        cellSize={1.6}
        cellThickness={0.4}
        cellColor={shade(theme.grid1, dim)}
        sectionSize={8}
        sectionThickness={0.8}
        sectionColor={shade(theme.grid2, dim)}
        fadeDistance={size * 0.75}
        fadeStrength={1.4}
        infiniteGrid={false}
      />
    </group>
  )
}
