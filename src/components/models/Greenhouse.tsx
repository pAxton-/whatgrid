import { Edges } from '@react-three/drei';

export default function Greenhouse({ position }: { position: [number, number, number] }) {
  const [x, , z] = position;
  const w = 8, h = 5, d = 6;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.4} roughness={0.1} />
        <Edges threshold={15} color="#e0f2fe" />
      </mesh>
      <mesh position={[0, h + 1.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[6, 3, 4]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.4} roughness={0.1} />
        <Edges threshold={15} color="#e0f2fe" />
      </mesh>
    </group>
  );
}
