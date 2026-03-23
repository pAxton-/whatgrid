import { useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { ITEM_DB } from '../data';
import PropertyObject from './models/PropertyObject';

interface PlacedItem {
  id: number;
  typeId: number;
  position: [number, number, number];
}

interface SceneProps {
  selectedTypeId: number;
}

function SceneContent({ selectedTypeId }: SceneProps) {
  const [items, setItems] = useState<PlacedItem[]>([]);
  const { raycaster, mouse, camera } = useThree();

  const handlePlaneClick = () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(new THREE.Mesh(new THREE.PlaneGeometry(300, 300)));
    
    if (intersects.length > 0) {
      const { x, z } = intersects[0].point;
      setItems([...items, { id: Date.now(), typeId: selectedTypeId, position: [x, 0, z] }]);
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 30, 10]} intensity={1.5} castShadow />
      
      <Grid infiniteGrid fadeDistance={150} sectionSize={5} sectionColor="#4ade80" cellColor="#334155" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handlePlaneClick} visible={false}>
        <planeGeometry args={[300, 300]} />
        <meshBasicMaterial />
      </mesh>

      {items.map((item) => (
        <PropertyObject key={item.id} item={item} typeInfo={ITEM_DB[item.typeId]} />
      ))}

      <OrbitControls makeDefault enableRotate={true} maxPolarAngle={Math.PI / 2 - 0.05} />
    </>
  );
}

export default function GardenScene({ selectedTypeId }: SceneProps) {
  return (
    <div className="w-full h-full bg-slate-900 cursor-crosshair">
      <Canvas shadows camera={{ position: [0, 30, 40], fov: 45 }}>
        <SceneContent selectedTypeId={selectedTypeId} />
      </Canvas>
    </div>
  );
}
