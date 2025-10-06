'use client';

import { useAppStore } from '@/hooks/useAppStore';

// We can define a set of default gradients
const GRADIENTS: Record<string, string> = {
  rainfall: 'bg-gradient-to-r from-blue-100 via-blue-300 to-blue-700',
  temperature: 'bg-gradient-to-r from-yellow-200 via-orange-400 to-red-600',
  anomaly: 'bg-gradient-to-r from-blue-600 via-gray-100 to-red-600',
  // Drought indices: CDD (long dry spells) -> warm/dry palette; CWD (wet spells) -> lush/green palette
  'drought-cdd': 'bg-gradient-to-r from-amber-50 via-amber-300 to-amber-700',
  'drought-cwd': 'bg-gradient-to-r from-emerald-100 via-emerald-400 to-emerald-700',
  default: 'bg-gradient-to-r from-gray-200 to-gray-600',
};

export const Legend = () => {
  // Read the dynamic legend data and other state from the store
  const { legendData, activeCategory, activeSubcategory, isAnomaly } = useAppStore();

  // Subcategories (and climatology) that never have rasters => force-hide legend regardless of stale legendData
  const noLegendSubcategories = new Set(['climatology', 'spi', 'spei']);
  if (activeSubcategory && noLegendSubcategories.has(activeSubcategory)) {
    return null;
  }

  // The legend is only visible if there is data for it AND raster-producing context
  if (!legendData) {
    return null;
  }
  
  // Determine which gradient and title to use
  let gradientClass = GRADIENTS.default;
  let title = 'Legend';

  if (isAnomaly) {
    gradientClass = GRADIENTS.anomaly;
    title = `Anomaly (${legendData.unit})`;
  } else if (activeCategory) {
    if (activeCategory === 'drought' && activeSubcategory) {
      const droughtKey = `drought-${activeSubcategory}`;
      gradientClass = GRADIENTS[droughtKey] || GRADIENTS.default;
    } else {
      gradientClass = GRADIENTS[activeCategory] || GRADIENTS.default;
    }
    const categoryLabel = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
    title = `${categoryLabel} (${legendData.unit})`;
  }

  return (
    <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm p-3 rounded-md shadow-lg w-64 z-10">
      <h4 className="font-semibold text-sm text-gray-800 mb-2">{title}</h4>
      <div className={`h-4 w-full rounded ${gradientClass}`}></div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        {/* Use the dynamic min/max values from the API response */}
        <span>{legendData.min.toFixed(2)}</span>
        <span>{legendData.max.toFixed(2)}</span>
      </div>
    </div>
  );
};