'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '@/hooks/useAppStore';
import { RasterOverlay } from './RasterOverlay';
import { RegionBoundaries } from './RegionBoundaries';
import { DrawControl } from './DrawControl';

export function MapComponent() {
  const { activeCategory, activeSubcategory, selectedKey, isAnomaly } = useAppStore();
  
  const initialCenter: [number, number] = [9.102, 40.715];

  return (
    <div className="relative h-full w-full">
      <MapContainer center={initialCenter} zoom={5} scrollWheelZoom={true} className="h-full w-full z-0">
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
  <RegionBoundaries />
  <DrawControl />
        <RasterOverlay />
      </MapContainer>
      
    </div>
  );

}

export default MapComponent;
