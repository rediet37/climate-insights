import { Feature, FeatureCollection, Geometry } from 'geojson';
import ethiopiaRegionsRaw from './et.json';
import ethiopiaWoredasRaw from './geoBoundaries-ETH-ADM3.json';

// Define the type for our region properties (ADM1 level)
export interface RegionProperties {
  id: string;
  name: string;
  source: string;
}

// Define the type for woreda properties (ADM3 level)
export interface WoredaProperties {
  shapeName: string;
  shapeISO: string;
  shapeID: string;
  shapeGroup: string;
  shapeType: string;
}

// Admin level type for the application
export type AdminLevel = 'nationwide' | 'region' | 'woreda';

// Correctly type the GeoJSON data
export const ethiopiaRegions: FeatureCollection<Geometry, RegionProperties> = ethiopiaRegionsRaw as any;
export const ethiopiaWoredas: FeatureCollection<Geometry, WoredaProperties> = ethiopiaWoredasRaw as any;

export default ethiopiaRegions;
