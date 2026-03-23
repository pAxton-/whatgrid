import { Edges } from '@react-three/drei';

export default function Plant({ position, color, isTree }: { position: [number, number, number], color: string, isTree: boolean }) {
  const [x, , z] = position;
  const scale = isTree ? 2.5 : 1;
  return (
    <group position={[x, 0, z]} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        {isTree ? <sphereGeometry args={[0.8, 16, 16]} /> : <coneGeometry args={[0.6, 1.2, 8]} />}
        <meshStandardMaterial color={color} />
        <Edges threshold={15} color="black" />
      </mesh>
    </group>
  );
}
