'use client';
import { useAppStore } from '@/hooks/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const FALLBACK_AVAILABLE_RANGE = {
  start: '1981-01-01',
  end: '2024-12-31',
} as const;

function normalizeAvailableRange(rangeData: { start: string; end: string }): { start: string; end: string } {
  const normalized = { ...rangeData };
  if (normalized.end && String(normalized.end).length === 4) {
    normalized.end = `${normalized.end}-12-31`;
  }
  if (normalized.start && String(normalized.start).length === 4) {
    normalized.start = `${normalized.start}-01-01`;
  }
  return normalized;
}

async function fetchAvailableDateRange(category: string): Promise<{ start: string; end: string }> {
  const endpointCategory = category === 'drought' ? 'rainfall' : category;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpointCategory}/available-range`);
    if (!res.ok) {
      throw new Error(`Failed to load available date range for ${category} (HTTP ${res.status}).`);
    }
    const rangeData = await res.json();
    return normalizeAvailableRange(rangeData);
  } catch (err) {
    console.warn(`Using fallback available range for ${category}.`, err);
    return FALLBACK_AVAILABLE_RANGE;
  }
}

export const YearPicker = () => {
  const { activeCategory, selectedKey, actions } = useAppStore();
  const { data: availableRange, isLoading } = useQuery({
    queryKey: ['availableDateRange', activeCategory],
    queryFn: () => fetchAvailableDateRange(activeCategory!),
    enabled: !!activeCategory,
  });

  // Set default value
  useEffect(() => {
    if (availableRange && !selectedKey) {
      const defaultYear = new Date(availableRange.end).getFullYear().toString();
      actions.setSelectedKey(defaultYear);
    }
  }, [availableRange, selectedKey, actions]);

  if (isLoading) return <p>Loading date range...</p>;

  const minYear = availableRange ? new Date(availableRange.start).getFullYear() : 1980;
  const maxYear = availableRange ? new Date(availableRange.end).getFullYear() : 2030;

  return (
    <div>
      <label htmlFor="year-picker" className="block text-sm font-medium text-gray-700">Select Year</label>
      <input
        type="number"
        id="year-picker"
        value={selectedKey || ''}
        min={minYear}
        max={maxYear}
        onChange={(e) => actions.setSelectedKey(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  );
};