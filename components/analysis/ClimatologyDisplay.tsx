'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/hooks/useAppStore';
import { Spinner } from '../shared/Spinner';

interface ClimatologyResponse {
  value: number;
  unit: string;
}

export const ClimatologyDisplay = () => {
  const {
    activeCategory,
    timeframeStart,
    timeframeEnd,
    selectedGeometry
  } = useAppStore();

  const { data: climatologyData, isLoading, isError } = useQuery<ClimatologyResponse>({
    queryKey: ['climatology', activeCategory, timeframeStart, timeframeEnd, selectedGeometry?.id || 'custom'],
    queryFn: async () => {
      if (!activeCategory || !timeframeStart || !timeframeEnd) {
        return null;
      }

      const startYear = new Date(timeframeStart).getFullYear();
      const endYear = new Date(timeframeEnd).getFullYear();
      const params: Record<string, string> = {
        start_year: String(startYear),
        end_year: String(endYear),
      };

      const requestBody: {
        params: Record<string, string>;
        geometry?: unknown;
      } = {
        params,
      };

      // Handle spatial filtering
      if (selectedGeometry) {
        if (selectedGeometry.type === 'region' && selectedGeometry.name) {
          // For predefined regions, include the region name in params
          requestBody.params.region = selectedGeometry.name;
        } else if (selectedGeometry.type === 'custom') {
          // For custom drawn areas, include the full geometry
          requestBody.geometry = selectedGeometry.geometry;
        }
      }

      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${activeCategory}/climatology`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error(`Failed to fetch climatology data.`);
      return res.json();
    },
    enabled: !!activeCategory && !!timeframeStart && !!timeframeEnd,
    retry: false,
  });

  // Display appropriate loading or error states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Spinner />
        <p className="text-gray-500 mt-2">Loading climatology data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        <p>Error loading climatology data.</p>
        <p className="text-sm mt-1">Please try adjusting your timeframe.</p>
      </div>
    );
  }

  if (!climatologyData) {
    return (
      <div className="text-gray-500 p-4 text-center">
        <p>No climatology data available for the selected timeframe.</p>
      </div>
    );
  }

  // Format the value to 2 decimal places for display
  const formattedValue = climatologyData.value.toFixed(2);
  
  // Calculate the number of years in the range
  const startYear = timeframeStart ? new Date(timeframeStart).getFullYear() : null;
  const endYear = timeframeEnd ? new Date(timeframeEnd).getFullYear() : null;
  const yearCount = startYear && endYear ? (endYear - startYear + 1) : null;
  
  // Determine the icon and color based on the category
  let icon = null;
  let valueColor = "text-blue-600";
  let bgGradient = "from-blue-50 to-blue-100";
  
  if (activeCategory === 'rainfall') {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14a2 2 0 01-2 2H7a2 2 0 01-2-2m14-4v4m0-11v3m-8 8H9m-4-8h4m-4 4h8" />
      </svg>
    );
    valueColor = "text-blue-600";
    bgGradient = "from-blue-50 to-blue-100";
  } else if (activeCategory === 'temperature') {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    valueColor = "text-red-600";
    bgGradient = "from-red-50 to-red-100";
  }

  const yearRange = startYear && endYear ? `${startYear} - ${endYear}` : 'selected period';

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-700 font-semibold mb-2 text-lg">Climatology Average</h3>
          <p className="text-gray-600 text-sm">
            Average value for {yearRange}
            {yearCount && ` (${yearCount} ${yearCount === 1 ? 'year' : 'years'})`}
          </p>
        </div>
        <div className="bg-white/60 p-2 rounded-full shadow-sm">
          {icon}
        </div>
      </div>
      
      <div className="flex items-center justify-center my-8">
        <div className="text-center">
          <span className={`text-5xl font-bold ${valueColor} block`}>
            {formattedValue}
          </span>
          <span className="text-lg text-gray-600 mt-2 block">
            {climatologyData.unit}
          </span>
        </div>
      </div>
      
      <div className="bg-white/60 rounded-lg p-4 mt-4 border border-white/80 shadow-sm">
        <h4 className="font-medium text-gray-700 mb-2">What this means</h4>
        <p className="text-sm text-gray-600">
          This represents the average {activeCategory === 'rainfall' ? 'precipitation' : activeCategory} 
          value across the selected years. This helps understand typical climate patterns over the selected time period.
        </p>
        
        {activeCategory === 'rainfall' && (
          <div className="mt-3 text-xs text-gray-500 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Typically measured in millimeters (mm) of precipitation.</span>
          </div>
        )}
        
        {activeCategory === 'temperature' && (
          <div className="mt-3 text-xs text-gray-500 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Typically measured in degrees Celsius (°C).</span>
          </div>
        )}
      </div>
    </div>
  );
};