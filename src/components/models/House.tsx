import { Edges } from '@react-three/drei';

export default function House({ position, color }: { position: [number, number, number], color: string }) {
  const [x, , z] = position;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 5, 8]} />
        <meshStandardMaterial color={color} />
        <Edges threshold={15} color="black" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 6.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[7, 3, 4]} />
        <meshStandardMaterial color="#1e293b" />
        <Edges threshold={15} color="black" />
      </mesh>
      {/* Chimney */}
      <mesh position={[2, 6.5, 2]} castShadow receiveShadow>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial color="#7f1d1d" />
      </mesh>
    </group>
  );
}
