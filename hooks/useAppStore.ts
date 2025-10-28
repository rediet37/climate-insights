import { create } from 'zustand';
import { Feature, Geometry, GeoJsonObject } from 'geojson';

// Top-level data category and subcategory controls the API endpoints and layers used
export type Category = 'rainfall' | 'temperature' | 'drought' | null;
export type Subcategory = 'daily' | 'monthly' | 'seasonal' | 'annual' | 'climatology' | 'cdd' | 'cwd' | 'spi' | 'spei' | null;
export type Region = string | null;

export interface LegendData {
  min: number;
  max: number;
  unit: string;
}

// Selected geometry attached to current analysis (either a named region or custom polygon)
export interface SelectedGeometry {
  type: 'region' | 'custom'; // Indicates if this is a predefined region or user-drawn
  id?: string;              // Region ID if type is 'region'
  name?: string;            // Display name
  geometry: Geometry;       // The actual GeoJSON geometry...maybeee change to GeoJsonObject
}

interface AppState {
  activeCategory: Category;
  activeSubcategory: Subcategory;
  timeframeStart: string | null;
  timeframeEnd: string | null;
  selectedKey: string | null;
  isAnomaly: boolean;
  infoModalId: string | null;
  legendData: LegendData | null;
  selectedRegion: Region;
  selectedGeometry: SelectedGeometry | null;
  isDrawingMode: boolean;
  sidebarNudgeTs?: number | null;

  actions: {
    setActive: (category: Category, subcategory: Subcategory) => void;
    setTimeframe: (start: string | null, end: string | null) => void;
    setSelectedKey: (key: string | null) => void;
    setAnomaly: (isAnomaly: boolean) => void;
    setInfoModalId: (id: string | null) => void;
    setLegendData: (data: LegendData | null) => void;
    setSelectedRegion: (region: Region) => void;
    setSelectedGeometry: (geometry: SelectedGeometry | null) => void;
    setDrawingMode: (isDrawing: boolean) => void;
    setRegionFirstSelection: (geometry: SelectedGeometry) => void;
    nudgeSidebar: () => void;
    reset: () => void;
  };
}

const initialState = {
  activeCategory: null,
  activeSubcategory: null,
  timeframeStart: null,
  timeframeEnd: null,
  selectedKey: null,
  isAnomaly: false,
  infoModalId: null,
  legendData: null,
  selectedRegion: null,
  selectedGeometry: null,
  isDrawingMode: false,
  sidebarNudgeTs: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  actions: {
    // Changing the active category/subcategory does not clear the current geometry selection
    setActive: (category, subcategory) => set((state) => ({
      activeCategory: category,
      activeSubcategory: subcategory,
      // keep selectedGeometry and other UI flags as-is; do not reset here
    } as Partial<AppState>)),
    setTimeframe: (start, end) => {
      // When the timeframe changes, reset the selectedKey as it may now be invalid.
      set({ timeframeStart: start, timeframeEnd: end, selectedKey: null });
    },
    setSelectedKey: (key) => set({ selectedKey: key }),
    setAnomaly: (isAnomaly) => set({ isAnomaly }),
    setInfoModalId: (id) => set({ infoModalId: id }),
    setLegendData: (data) => set({ legendData: data }),
    setSelectedRegion: (region) => {
      // For backward compatibility, setting selectedRegion to null also clears selectedGeometry
      if (region === null) {
        set({ selectedRegion: null, selectedGeometry: null });
      } else {
        set({ selectedRegion: region });
      }
    },
    setSelectedGeometry: (geometry) => {
      // Keep selectedRegion in sync when geometry points to a named region
      if (geometry && geometry.type === 'region' && geometry.id) {
        set({ selectedGeometry: geometry, selectedRegion: geometry.id });
      } else if (geometry === null) {
        set({ selectedGeometry: null, selectedRegion: null });
      } else {
        // For custom geometries, clear selectedRegion
        set({ selectedGeometry: geometry, selectedRegion: null });
      }
    },
    setDrawingMode: (isDrawing) => set({ isDrawingMode: isDrawing }),
    // Region-first flow: reset analysis parameters and set geometry
    setRegionFirstSelection: (geometry) => {
      set({
        // Reset analysis-related state
        activeCategory: null,
        activeSubcategory: null,
        timeframeStart: null,
        timeframeEnd: null,
        selectedKey: null,
        isAnomaly: false,
        // Set geometry
        selectedGeometry: geometry,
        selectedRegion: geometry.type === 'region' && geometry.id ? geometry.id : null,
      });
    },
    // Sidebar visual nudge signal
    nudgeSidebar: () => set({ sidebarNudgeTs: Date.now() }),
    reset: () => set(initialState),
  },
}));