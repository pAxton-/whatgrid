import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import { PropertyData } from './PropertySetupMap';

interface GardenSceneProps {
  propertyData: PropertyData;
}

// This component converts GPS coordinates into a custom 3D mesh
function YardMesh({ boundary, centerLat, centerLng }: { boundary: [number, number][], centerLat: number, centerLng: number }) {
  const shape = useMemo(() => {
    const yardShape = new THREE.Shape();
    
    // Constants to convert Longitude/Latitude degrees into meters
    const R = 6378137; // Earth's radius in meters
    const latToMeters = (Math.PI * R) / 180;
    const lngToMeters = latToMeters * Math.cos((centerLat * Math.PI) / 180);

    boundary.forEach((coord, index) => {
      // Calculate how many meters this point is from the center (0,0,0)
      const x = (coord[0] - centerLng) * lngToMeters;
      const y = (coord[1] - centerLat) * latToMeters;

      // Draw the lines of the shape
      if (index === 0) {
        yardShape.moveTo(x, y);
      } else {
        yardShape.lineTo(x, y);
      }
    });

    return yardShape;
  }, [boundary, centerLat, centerLng]);

  return (
    // We rotate the shape -90 degrees on the X-axis so it lies flat on the ground
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#2d5a27" side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function GardenScene({ propertyData }: GardenSceneProps) {
  return (
    <Canvas camera={{ position: [0, 15, 20], fov: 50 }} shadows>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      
      {/* Our new custom property shape */}
      <YardMesh 
        boundary={propertyData.boundary} 
        centerLat={propertyData.lat} 
        centerLng={propertyData.lng} 
      />
      
      <OrbitControls />
      {/* A grid helps you see the scale. Each square is 10x10 meters */}
      <gridHelper args={[200, 20]} position={[0, -0.1, 0]} />
    </Canvas>
  );
}