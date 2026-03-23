import { Edges } from '@react-three/drei';

export default function Barn({ position, color, isBarn }: { position: [number, number, number], color: string, isBarn: boolean }) {
  const [x, , z] = position;
  const w = isBarn ? 10 : 8;
  const h = isBarn ? 6 : 5;
  const d = isBarn ? 8 : 6;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} />
        <Edges threshold={15} color="black" />
      </mesh>
      <mesh position={[0, h + 1.5, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[d/2 + 0.5, d/2 + 0.5, w + 0.5, 3]} />
        <meshStandardMaterial color="#475569" />
        <Edges threshold={15} color="black" />
      </mesh>
    </group>
  );
}
