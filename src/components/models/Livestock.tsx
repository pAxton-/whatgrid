import { Edges } from '@react-three/drei';

export default function Livestock({ position, color }: { position: [number, number, number], color: string }) {
  const [x, , z] = position;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1, 2.5]} />
        <meshStandardMaterial color={color} />
        <Edges threshold={15} color="black" />
      </mesh>
      <mesh position={[0, 1.8, 1]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={color} />
        <Edges threshold={15} color="black" />
      </mesh>
    </group>
  );
}
