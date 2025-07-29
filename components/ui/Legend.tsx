'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/hooks/useAppStore';

interface LegendVisuals {
  title: string;
  gradient: string;
}

const legendVisualsMap: Record<string, LegendVisuals> = {
  rainfall: {
    title: 'Rainfall (mm)',
    gradient: 'bg-gradient-to-r from-blue-100 to-blue-700',
  },
  temperature: {
    title: 'Avg Temperature (°C)',
    gradient: 'bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600',
  },
  drought: {
    title: 'Drought Index / Days',
    gradient: 'bg-gradient-to-r from-yellow-200 via-orange-400 to-amber-800',
  },
  anomaly: {
    title: 'Anomaly',
    gradient: 'bg-gradient-to-r from-blue-500 via-gray-100 to-red-500',
  },
};

interface RasterQueryData {
  image: string;
  bounds: number[][];
  dataRange: {
    min: number;
    max: number;
  };
}

export const Legend = () => {
  const { activeCategory, activeSubcategory, selectedKey, isAnomaly } = useAppStore();
  const isVisible =
    !!activeCategory &&
    !!selectedKey && 
    activeSubcategory !== 'climatology' &&
    activeSubcategory !== 'spi';

  const { data: rasterData } = useQuery<RasterQueryData>({
    queryKey: ['raster', activeCategory, activeSubcategory, selectedKey, isAnomaly],
    queryFn: async () => {
      const anomalyQuery = isAnomaly ? '?anomaly=true' : '';
      const res = await fetch(`/api/raster/${activeCategory}/${activeSubcategory}/${selectedKey}${anomalyQuery}`);
      if (!res.ok) throw new Error('Failed to fetch raster data for legend');
      return res.json();
    },
    enabled: isVisible, 
  });

  if (!isVisible || !rasterData?.dataRange) {
    return null;
  }

  let visualKey = '';
  if (isAnomaly) {
    visualKey = 'anomaly';
  } else if (activeSubcategory === 'cdd' || activeSubcategory === 'cwd') {
    visualKey = 'drought';
  } else if (activeCategory) {
    visualKey = activeCategory;
  }

  const visuals = legendVisualsMap[visualKey];
  if (!visuals) {
    return null;
  }

  const { min, max } = rasterData.dataRange;

  return (
    <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm p-3 rounded-md shadow-lg w-64 z-10">
      <h4 className="font-semibold text-sm text-gray-800 mb-2">{visuals.title}</h4>
      
      <div className={`h-4 w-full rounded ${visuals.gradient}`}></div>
      
      <div className="flex justify-between text-xs text-gray-600 mt-1 font-mono">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
};