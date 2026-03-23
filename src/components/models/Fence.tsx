import { Edges } from '@react-three/drei';

export default function Fence({ position }: { position: [number, number, number] }) {
  const [x, , z] = position;
  return (
    <group position={[x, 0, z]}>
      {/* Posts */}
      <mesh position={[-1.8, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1.6, 0.2]} />
        <meshStandardMaterial color="#5E4028" />
        <Edges threshold={15} color="black" />
      </mesh>
      <mesh position={[1.8, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1.6, 0.2]} />
        <meshStandardMaterial color="#5E4028" />
        <Edges threshold={15} color="black" />
      </mesh>
      {/* Wooden Rails */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.1, 0.05]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.1, 0.05]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}
