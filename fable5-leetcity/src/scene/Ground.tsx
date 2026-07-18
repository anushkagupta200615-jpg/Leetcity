import { Grid } from '@react-three/drei'

export default function Ground({ radius }: { radius: number }) {
  const size = Math.max(80, radius * 2.6)
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#12151c" roughness={1} />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={[size, size]}
        cellSize={1.6}
        cellThickness={0.4}
        cellColor="#1d2230"
        sectionSize={8}
        sectionThickness={0.8}
        sectionColor="#262d40"
        fadeDistance={size * 0.75}
        fadeStrength={1.4}
        infiniteGrid={false}
      />
    </group>
  )
}
