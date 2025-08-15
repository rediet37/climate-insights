import { Feature, FeatureCollection, Geometry } from 'geojson';
import ethiopiaRegionsRaw from './et.json';

// Define the type for our region properties
export interface RegionProperties {
  id: string;
  name: string;
  source: string;
}

// Correctly type the GeoJSON data
export const ethiopiaRegions: FeatureCollection<Geometry, RegionProperties> = ethiopiaRegionsRaw as any;

export default ethiopiaRegions;
