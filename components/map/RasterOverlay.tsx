'use client';

import { useQuery } from '@tanstack/react-query';
import { ImageOverlay, Tooltip } from 'react-leaflet';
import { LatLngBoundsExpression } from 'leaflet';
import { useAppStore, Category, Subcategory, LegendData, SelectedGeometry } from '@/hooks/useAppStore';
import { Spinner } from '@/components/shared/Spinner';
import { useEffect } from 'react';

export interface RasterResponse {
  image: string;
  bounds: LatLngBoundsExpression;
  legend: LegendData;
}

async function fetchRasterData(
  category: Category,
  subcategory: Subcategory,
  key: string,
  isAnomaly: boolean,
  selectedGeometry: SelectedGeometry | null
): Promise<RasterResponse | null> {
  if (!category || !subcategory || !key || ['climatology', 'spi', 'spei'].includes(subcategory)) {
    return null;
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const endpoint = `${API_BASE_URL}/${category}/${subcategory}/raster-image`;

  const params: Record<string, string | boolean> = {};
  if (subcategory === 'daily' || subcategory === 'cdd' || subcategory === 'cwd') {
    const [year, month, day] = key.split('-');
    params.year = year;
    params.month = month;
    params.day = day;
  } else if (subcategory === 'monthly') {
    const [year, month] = key.split('-');
    params.year = year;
    params.month = month;
  } else if (subcategory === 'seasonal') {
    const [season, year] = key.split('-');
    params.season = season;
    params.year = year;
  } else if (subcategory === 'annual') {
    params.year = key;
  }

  if (isAnomaly) {
    params.anomaly = true;
  }

  const requestBody: { params: Record<string, string | boolean>; region?: string; geometry?: unknown } = {
    params,
  };

  if (selectedGeometry) {
    if (selectedGeometry.type === 'region' && selectedGeometry.name) {
      // Use the 'name' property of the regions instead of the 'id'
      requestBody.params.region = selectedGeometry.name;
    } else if (selectedGeometry.type === 'woreda' && selectedGeometry.name) {
      // Use the 'name' property (shapeName) of the woredas
      requestBody.params.woreda = selectedGeometry.name;
    } else if (selectedGeometry.type === 'custom') {
      requestBody.geometry = selectedGeometry.geometry;
    }
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    throw new Error(`No data found for the selected parameters.`);
  }

  return res.json();
}

export function RasterOverlay() {
  const { activeCategory, activeSubcategory, selectedKey, isAnomaly, selectedGeometry, actions } = useAppStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['raster', activeCategory, activeSubcategory, selectedKey, isAnomaly, selectedGeometry],
    queryFn: () => fetchRasterData(activeCategory!, activeSubcategory!, selectedKey!, isAnomaly, selectedGeometry),
    enabled: !!activeCategory && !!activeSubcategory && !!selectedKey,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data) {
      actions.setLegendData(data.legend);
    } else {
      actions.setLegendData(null);
    }
  }, [data, actions]);

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
          <p className="text-xs font-normal">Please try a different selection.</p>
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