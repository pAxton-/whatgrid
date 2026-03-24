import { useState, useCallback } from 'react';
import { Map, NavigationControl, useControl } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

function DrawControl(props: any) {
  useControl(
    () => new MapboxDraw(props),
    ({ map }: { map: any }) => {
      map.on('draw.create', props.onUpdate);
      map.on('draw.update', props.onUpdate);
      map.on('draw.delete', props.onUpdate);
    },
    ({ map }: { map: any }) => {
      map.off('draw.create', props.onUpdate);
      map.off('draw.update', props.onUpdate);
      map.off('draw.delete', props.onUpdate);
    },
    {
      position: props.position
    }
  );
  return null;
}

export interface PropertyData {
  sqft: number;
  lat: number;
  lng: number;
  boundary: [number, number][]; // New: Array of [longitude, latitude] coordinates
}

interface PropertySetupMapProps {
  onConfirm: (data: PropertyData) => void;
}

export default function PropertySetupMap({ onConfirm }: PropertySetupMapProps) {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);

  const onUpdate = useCallback((e: any) => {
    const data = e.features;
    if (data.length > 0) {
      const polygon = data[0];
      const areaSquareMeters = turf.area(polygon);
      const sqft = areaSquareMeters * 10.7639; 
      const center = turf.centerOfMass(polygon);
      const lng = center.geometry.coordinates[0];
      const lat = center.geometry.coordinates[1];
      
      // Grab the actual shape coordinates (the outer ring of the polygon)
      const boundary = polygon.geometry.coordinates[0];

      setPropertyData({ sqft: Math.round(sqft), lat, lng, boundary });
    } else {
      setPropertyData(null);
    }
  }, []);

  return (
    <div className="fixed inset-0 w-[100dvw] h-[100dvh] bg-gray-950 flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none flex justify-center">
        <div className="bg-gray-900/95 p-6 rounded-2xl border border-gray-800 shadow-2xl pointer-events-auto max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-green-500 mb-2 tracking-tight">Trace Your Property</h1>
          <p className="text-gray-400 text-xs mb-4">Click the corners of your yard to calculate area.</p>
          {propertyData ? (
            <div className="bg-black/50 p-4 rounded-xl border border-green-500/30 mb-4">
              <div className="text-xl font-black text-white">{propertyData.sqft.toLocaleString()} <span className="text-sm text-gray-500">SQFT</span></div>
            </div>
          ) : (
            <div className="bg-black/50 p-4 rounded-xl border border-dashed border-gray-700 mb-4 text-gray-500 text-sm">Waiting for boundary...</div>
          )}
          <button 
            disabled={!propertyData}
            onClick={() => propertyData && onConfirm(propertyData)} 
            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            Launch Simulator
          </button>
        </div>
      </div>
      <Map
        initialViewState={{ longitude: -98.5, latitude: 39.8, zoom: 4 }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        <DrawControl
          position="top-right"
          displayControlsDefault={false}
          controls={{ polygon: true, trash: true }}
          defaultMode="draw_polygon"
          onUpdate={onUpdate}
        />
      </Map>
    </div>
  );
}