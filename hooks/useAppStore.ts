import { create } from 'zustand';

export type Category = 'rainfall' | 'temperature' | 'drought' | null;
export type Subcategory = 'daily' | 'monthly' | 'seasonal' | 'annual' | 'climatology' | 'cdd' | 'cwd' | 'spi' | 'spei' | null;

interface AppState {
  activeCategory: Category;
  activeSubcategory: Subcategory;
  timeframeStart: string | null;
  timeframeEnd: string | null;
  selectedKey: string | null;
  isAnomaly: boolean;
  infoModalId: string | null;
  actions: {
    setActive: (category: Category, subcategory: Subcategory) => void;
    setTimeframe: (start: string | null, end: string | null) => void;
    setSelectedKey: (key: string | null) => void;
    setAnomaly: (isAnomaly: boolean) => void;
    setInfoModalId: (id: string | null) => void;
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
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  actions: {
    setActive: (category, subcategory) => set({ ...initialState, activeCategory: category, activeSubcategory: subcategory }),
    setTimeframe: (start, end) => {
      // When the timeframe changes, reset the selectedKey as it may now be invalid.
      set({ timeframeStart: start, timeframeEnd: end, selectedKey: null });
    },
    setSelectedKey: (key) => set({ selectedKey: key }),
    setAnomaly: (isAnomaly) => set({ isAnomaly }),
    setInfoModalId: (id) => set({ infoModalId: id }),
    reset: () => set(initialState),
  },
}));