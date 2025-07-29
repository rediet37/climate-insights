'use client';

import { useQuery } from '@tanstack/react-query';
import { ImageOverlay, Tooltip } from 'react-leaflet';
import { LatLngBoundsExpression } from 'leaflet';
import { useAppStore, Category, Subcategory } from '@/hooks/useAppStore';
import {Spinner} from '@/components/shared/Spinner';

async function fetchRasterData(category: Category, subcategory: Subcategory, key: string, isAnomaly: boolean) {
  if (!category || !subcategory || !key || subcategory === 'climatology' || subcategory === 'spi' || subcategory === 'spei') return null;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const params = new URLSearchParams();

  // parse the 'key' to generate query parameters
  if (subcategory === 'daily' || subcategory === 'cdd' || subcategory === 'cwd') {
    const [year, month, day] = key.split('-');
    params.append('year', year);
    params.append('month', month);
    params.append('day', day);
  } else if (subcategory === 'monthly') {
    const [year, month] = key.split('-');
    params.append('year', year);
    params.append('month', month);
  } else if (subcategory === 'seasonal') {
    const [season, year] = key.split('-');
    params.append('season', season);
    params.append('year', year);
  } else if (subcategory === 'annual') {
    params.append('year', key);
  }

  if (isAnomaly) {
    params.append('anomaly', 'true');
  }

  const url = `${API_BASE_URL}/${category}/${subcategory}/raster-image?${params.toString()}`;
  
  const res = await fetch(url);

  if (!res.ok) {
    // This will trigger the `isError` state in useQuery, including for 404 Not Found.
    throw new Error(`No data found for the selected parameters.`);
  }

  return res.json();
}

export function RasterOverlay() {
  const { activeCategory, activeSubcategory, selectedKey, isAnomaly } = useAppStore();

  const { data, isLoading, isError } = useQuery<{ image: string; bounds: LatLngBoundsExpression }>({
    // The queryKey includes all dependencies. When any of these change, useQuery will refetch.
    queryKey: ['raster', activeCategory, activeSubcategory, selectedKey, isAnomaly], 
    queryFn: () => fetchRasterData(activeCategory!, activeSubcategory!, selectedKey!, isAnomaly),    
    enabled: !!activeCategory && !!activeSubcategory && !!selectedKey,
    retry: false,
  });

  if (isLoading) {
    return (
        <Tooltip position={[9.145, 40.4897]} permanent direction="center" className="loading-tooltip">
            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
                <Spinner />
            </div>
        </Tooltip>
    );
  }

  if (isError) {
    return (
      <Tooltip position={[9.145, 40.4897]} permanent direction="center" className="error-tooltip">
        <div className="p-3 bg-red-100 text-red-700 font-semibold rounded-md shadow-lg text-center">
          <p>No map data available for {selectedKey}.</p>
          <p className="text-xs font-normal">Please select a different date.</p>
        </div>
      </Tooltip>
    );
  }

  if (!data || !data.image) {
    return null;
  }

  return (
    <ImageOverlay
      url={data.image}
      bounds={data.bounds}
      opacity={0.75}
      zIndex={10}
      key={data.image}
    />
  );
}
