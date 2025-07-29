'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/hooks/useAppStore';
import { Spinner } from '../shared/Spinner';
import { useEffect } from 'react';

function formatKeyForDisplay(key: string, subcategory: string | null): string {
  if (!key || !subcategory) return 'N/A';
  try {
    if (subcategory === 'daily') {
      const [year, month, day] = key.split('-');
      return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)))
        .toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
    }
    if (subcategory === 'monthly') {
      const [year, month] = key.split('-');
      return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1))
        .toLocaleDateString('en-GB', { year: 'numeric', month: 'short', timeZone: 'UTC' });
    }
    if (subcategory === 'seasonal') {
      const [season, year] = key.split('-');
      return `${season} ${year}`;
    }
    return key; // For 'annual'
  } catch (e) {
    return key;
  }
}

/**
 * Renders the appropriate dropdown selector (Date, Month, etc.) based on the
 * active subcategory and populates it with data from the `/api/config` endpoint.
 * It also handles setting the initial default selection.
 */
export const DataControls = () => {
  const { activeSubcategory, selectedKey, actions } = useAppStore();

  const { data: configData, isLoading, isError } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error('Failed to load configuration.');
      return res.json();
    },
    staleTime: Infinity, // Config data is static, cache it forever
  });

  const keys =
    activeSubcategory === 'daily' || activeSubcategory === 'cdd' || activeSubcategory === 'cwd'
      ? configData?.dates
      : activeSubcategory === 'monthly' || activeSubcategory === 'spi'
      ? configData?.months
      : activeSubcategory === 'seasonal'
      ? configData?.seasons
      : activeSubcategory === 'annual'
      ? configData?.years
      : [];
      
  const label =
    activeSubcategory === 'daily' || activeSubcategory === 'cdd' || activeSubcategory === 'cwd'
      ? 'Select Date:'
      : activeSubcategory === 'monthly' || activeSubcategory === 'spi'
      ? 'Select Month:'
      : activeSubcategory === 'seasonal'
      ? 'Select Season:'
      : activeSubcategory === 'annual'
      ? 'Select Year:'
      : 'Select:';

  useEffect(() => {
    if (selectedKey || !keys || keys.length === 0) {
      return;
    }
    actions.setSelectedKey(keys[0]);
  }, [keys, selectedKey, actions]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Spinner />
        <span>Loading Controls...</span>
      </div>
    );
  }

  if (isError || !keys || keys.length === 0) {
    return (
      <div className="text-sm text-red-600">
        Could not load selection options.
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="data-select" className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id="data-select"
        value={selectedKey || ''}
        onChange={(e) => actions.setSelectedKey(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        {keys.map((key: string) => (
          <option key={key} value={key}>
            {formatKeyForDisplay(key, activeSubcategory)}
          </option>
        ))}
      </select>
    </div>
  );
};