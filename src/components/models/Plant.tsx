import { Edges } from '@react-three/drei';

export default function Plant({ position, color, isTree, isSprout }: { position: [number, number, number], color: string, isTree?: boolean, isSprout?: boolean }) {
  const scale = isSprout ? 0.3 : 1;
  const height = isTree ? 4 : isSprout ? 0.5 : 1.5;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk/Stem */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.2, height]} />
        <meshStandardMaterial color="#3f2b1d" />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, height, 0]}>
        <sphereGeometry args={[isTree ? 2 : 0.6]} />
        <meshStandardMaterial color={color} />
        <Edges threshold={15} color="black" />
      </mesh>
    </group>
  );
}
