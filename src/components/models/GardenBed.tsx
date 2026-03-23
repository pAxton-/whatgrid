import { Edges } from '@react-three/drei';

export default function GardenBed({ position }: { position: [number, number, number] }) {
  const [x, , z] = position;
  const w = 4, h = 0.5, d = 1.5;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#8B4513" /> 
        <Edges threshold={15} color="black" />
      </mesh>
      <mesh position={[0, h / 2 + 0.01, 0]} receiveShadow>
        <boxGeometry args={[w - 0.2, h, d - 0.2]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>
    </group>
  );
}
