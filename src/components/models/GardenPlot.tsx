export default function GardenPlot({ position }: { position: [number, number, number] }) {
  const [x, , z] = position;
  return (
    <mesh position={[x, 0.1, z]} receiveShadow>
      <boxGeometry args={[4, 0.2, 4]} />
      <meshStandardMaterial color="#3d2817" />
    </mesh>
  );
}
