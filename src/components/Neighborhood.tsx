import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

interface NeighborhoodProps {
  centerLat: number;
  centerLng: number;
  radius?: number; // How far out to fetch buildings (in meters)
}

interface BuildingData {
  id: number;
  coordinates: [number, number][]; // Polygon points
  height: number;
}

export default function Neighborhood({ centerLat, centerLng, radius = 100 }: NeighborhoodProps) {
  const [buildings, setBuildings] = useState<BuildingData[]>([]);

  useEffect(() => {
    // 1. Calculate a "Bounding Box" to tell the API where to look
    const latOffset = radius / 111320; 
    const lngOffset = radius / (40075000 * Math.cos((centerLat * Math.PI) / 180) / 360);
    
    const s = centerLat - latOffset;
    const n = centerLat + latOffset;
    const w = centerLng - lngOffset;
    const e = centerLng + lngOffset;

    // 2. The query asking for "buildings" inside that box
    const query = `
      [out:json][timeout:25];
      (
        way["building"](${s},${w},${n},${e});
        relation["building"](${s},${w},${n},${e});
      );
      out body;
      >;
      out skel qt;
    `;

    const fetchBuildings = async () => {
      try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });
        const data = await response.json();

        // 3. Extract the geometry
        const nodes = new Map();
        data.elements.forEach((el: any) => {
          if (el.type === 'node') {
            nodes.set(el.id, [el.lon, el.lat]);
          }
        });

        const extractedBuildings: BuildingData[] = [];
        data.elements.forEach((el: any) => {
          if (el.type === 'way' && el.tags?.building) {
            const coords = el.nodes.map((nodeId: number) => nodes.get(nodeId)).filter(Boolean);
            
            // Guess a default height if the map doesn't specify one (approx 1 story = 4m)
            const heightStr = el.tags.height || el.tags['building:levels'];
            let height = 4; 
            if (heightStr) {
              height = el.tags.height ? parseFloat(el.tags.height) : parseFloat(heightStr) * 3;
            }

            if (coords.length > 2) {
              extractedBuildings.push({ id: el.id, coordinates: coords, height });
            }
          }
        });

        setBuildings(extractedBuildings);
      } catch (error) {
        console.error("Failed to fetch neighborhood data", error);
      }
    };

    fetchBuildings();
  }, [centerLat, centerLng, radius]);

  // 4. Convert GPS to 3D Shapes
  const R = 6378137; 
  const latToMeters = (Math.PI * R) / 180;
  const lngToMeters = latToMeters * Math.cos((centerLat * Math.PI) / 180);

  const extrudeSettings = { depth: 1, bevelEnabled: false };

  return (
    <group>
      {buildings.map((b) => {
        const shape = new THREE.Shape();
        b.coordinates.forEach((coord, index) => {
          const x = (coord[0] - centerLng) * lngToMeters;
          const y = (coord[1] - centerLat) * latToMeters;
          if (index === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        });

        return (
          <mesh 
            key={b.id} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0, 0]} 
            castShadow 
            receiveShadow
          >
            <extrudeGeometry args={[shape, { ...extrudeSettings, depth: b.height }]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}