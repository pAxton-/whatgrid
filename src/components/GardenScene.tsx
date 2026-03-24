import { useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls, Sky, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import PropertyObject from './models/PropertyObject';
import { ITEM_DB } from '../data';
import { PropertyData } from './PropertySetupMap'; 
import Neighborhood from './Neighborhood';

interface SceneProps {
  items: any[];
  mode: string; 
  selectedItemId: number | null;
  propertySize: number;
  month: number;
  timeOfDay: number; // 0 to 24
  onGroundClick: (x: number, z: number) => void;
  onItemClick: (item: any) => void;
  onUpdateTransform: (id: number, pos: [number, number, number], rot: [number, number, number]) => void;
  onCameraRotate: (angle: number) => void;
  propertyData: PropertyData; // Brought in from Mapbox setup
}

// Astronomical math to get exact Sun X, Y, Z vector
function getSunVector(lat: number, month: number, hour: number): [number, number, number] {
  const latRad = (lat * Math.PI) / 180;
  const dayOfYear = Math.floor((month - 1) * 30.4);
  
  // Earth's tilt (Declination)
  const declination = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
  const decRad = (declination * Math.PI) / 180;

  // Hour angle
  const hourAngle = (hour - 12) * 15;
  const haRad = (hourAngle * Math.PI) / 180;

  // Elevation (Height in the sky)
  const sinEl = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const elRad = Math.asin(sinEl);

  // Azimuth (Compass direction)
  const cosAz = (Math.sin(decRad) - Math.sin(elRad) * Math.sin(latRad)) / (Math.cos(elRad) * Math.cos(latRad));
  let azRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (hour > 12) azRad = 2 * Math.PI - azRad;

  // Convert to 3D Cartesian coords (Z is South)
  const distance = 100;
  const y = distance * Math.sin(elRad); 
  const r = distance * Math.cos(elRad);
  const x = r * Math.sin(azRad); 
  const z = -r * Math.cos(azRad); 

  return [x, y, z];
}

// The new custom 3D mesh based on Mapbox GPS coordinates
function YardMesh({ boundary, centerLat, centerLng, isNight, onGroundClick }: { boundary: [number, number][], centerLat: number, centerLng: number, isNight: boolean, onGroundClick: (x: number, z: number) => void }) {
  const shape = useMemo(() => {
    const yardShape = new THREE.Shape();
    
    // Constants to convert Longitude/Latitude degrees into meters
    const R = 6378137; 
    const latToMeters = (Math.PI * R) / 180;
    const lngToMeters = latToMeters * Math.cos((centerLat * Math.PI) / 180);

    boundary.forEach((coord, index) => {
      const x = (coord[0] - centerLng) * lngToMeters;
      const y = (coord[1] - centerLat) * latToMeters;
      if (index === 0) {
        yardShape.moveTo(x, y);
      } else {
        yardShape.lineTo(x, y);
      }
    });

    return yardShape;
  }, [boundary, centerLat, centerLng]);

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow 
      onClick={(e) => {
        e.stopPropagation();
        onGroundClick(e.point.x, e.point.z);
      }}
    >
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color={isNight ? "#022c22" : "#064e3b"} roughness={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SceneContent({ items, mode, selectedItemId, propertySize, month, timeOfDay, onGroundClick, onItemClick, onUpdateTransform, onCameraRotate, propertyData }: SceneProps) {
  const [dragging, setDragging] = useState(false);

  useFrame(({ camera }) => {
    onCameraRotate(Math.atan2(camera.position.x, camera.position.z));
  });

  // Calculate sun using the exact GPS latitude of the drawn property
  const sunPosition = useMemo(() => getSunVector(propertyData.lat, month, timeOfDay), [propertyData.lat, month, timeOfDay]);
  const isNight = sunPosition[1] < 0;

  // Change lighting depending on day/night cycle
  const ambientIntensity = isNight ? 0.1 : 0.5;
  const directionalIntensity = isNight ? 0.2 : Math.max(0, sunPosition[1] / 50) * 1.5;
  const skyColor = isNight ? "#020617" : "#111827";

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, propertySize, propertySize * 3]} />
      
      {/* Dynamic Sky */}
      <Sky sunPosition={sunPosition} turbidity={isNight ? 0.1 : 0.2} rayleigh={isNight ? 0.1 : 0.5} />
      <Environment preset={isNight ? "night" : "city"} /> 

      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={sunPosition} 
        intensity={directionalIntensity} 
        color={isNight ? "#60a5fa" : "#fff9e6"} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-left={-propertySize}
        shadow-camera-right={propertySize}
        shadow-camera-top={propertySize}
        shadow-camera-bottom={-propertySize}
        shadow-camera-near={0.1}
        shadow-camera-far={500}
      />
      
      {/* The new Custom Mapbox Property Ground */}
      <YardMesh 
        boundary={propertyData.boundary}
        centerLat={propertyData.lat}
        centerLng={propertyData.lng}
        isNight={isNight}
        onGroundClick={onGroundClick}
      />

      {/* The 3D Surrounding Buildings */}
   <Neighborhood 
     centerLat={propertyData.lat} 
     centerLng={propertyData.lng} 
     radius={150} 
   />

      <Grid 
        infiniteGrid={false}
        args={[propertySize, propertySize]}
        sectionSize={5}
        cellSize={1}
        sectionColor="#10b981" 
        cellColor="#064e3b" 
        position={[0, 0.05, 0]} 
        fadeDistance={propertySize}
      />

      <ContactShadows opacity={isNight ? 0.2 : 0.5} scale={propertySize} blur={2} far={15} resolution={512} color="#000" />

      {items.map((item) => {
        const isSelected = mode === 'EDIT' && selectedItemId === item.id;
        return (
          <group key={item.id}>
            {isSelected ? (
              <TransformControls 
                mode="translate" 
                showY={false} 
                onMouseDown={() => setDragging(true)}
                onMouseUp={(e: any) => {
                  setDragging(false);
                  if (e?.target?.object) {
                    const { x, y, z } = e.target.object.position;
                    const { x: rx, y: ry, z: rz } = e.target.object.rotation;
                    onUpdateTransform(item.id, [x, y, z], [rx, ry, rz]);
                  }
                }}
              >
                <group position={item.position} rotation={item.rotation || [0, 0, 0]}>
                  <PropertyObject item={{...item, position: [0,0,0]}} typeInfo={ITEM_DB[item.typeId]} />
                </group>
              </TransformControls>
            ) : (
              <group 
                position={item.position} 
                rotation={item.rotation || [0, 0, 0]} 
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick(item);
                }}
              >
                <PropertyObject item={{...item, position: [0,0,0]}} typeInfo={ITEM_DB[item.typeId]} />
              </group>
            )}
          </group>
        );
      })}

      <OrbitControls makeDefault enableRotate={!dragging} enablePan={!dragging} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

export default function GardenScene(props: SceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [props.propertySize * 0.8, props.propertySize * 0.5, props.propertySize * 0.8], fov: 45 }}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
}