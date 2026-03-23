import Plant from './Plant';

export default function GardenBed({ position, contents }: { position: [number, number, number], contents?: any[] }) {
  const [x, , z] = position;
  
  // Calculate plant positions
  const totalPlants = contents?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  const gridSide = Math.ceil(Math.sqrt(totalPlants));
  const spacing = 3.5 / Math.max(gridSide, 1);

  return (
    <group position={[x, 0, z]}>
      {/* Wooden Frame */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.8, 4.2]} />
        <meshStandardMaterial color="#5E4028" />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[3.8, 0.8, 3.8]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>

      {/* Sprouted Plants */}
      {contents?.map((item, groupIdx) => {
        // Simple grid placement logic
        return Array.from({ length: item.quantity }).map((_, i) => {
          const row = Math.floor((i + groupIdx * 5) / gridSide);
          const col = (i + groupIdx * 5) % gridSide;
          return (
            <Plant 
              key={`${item.id}-${i}`}
              position={[
                (col - (gridSide - 1) / 2) * spacing,
                0.8,
                (row - (gridSide - 1) / 2) * spacing
              ]}
              color="#22c55e"
              isSprout={true}
            />
          );
        });
      })}
    </group>
  );
}
