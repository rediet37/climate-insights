'use client';

import { useAppStore } from '@/hooks/useAppStore';

// We can define a set of default gradients
const GRADIENTS: Record<string, string> = {
  rainfall: 'bg-gradient-to-r from-blue-100 to-blue-700',
  temperature: 'bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600',
  anomaly: 'bg-gradient-to-r from-blue-500 via-gray-100 to-red-500',
  default: 'bg-gradient-to-r from-gray-200 to-gray-600',
};

export const Legend = () => {
  // Read the dynamic legend data and other state from the store
  const { legendData, activeCategory, isAnomaly } = useAppStore();

  // The legend is only visible if there is data for it in the store.
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
      gradientClass = GRADIENTS[activeCategory] || GRADIENTS.default;
      title = `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} (${legendData.unit})`;
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