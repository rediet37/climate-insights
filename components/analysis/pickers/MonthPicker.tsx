'use client';
import { useAppStore } from '@/hooks/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

async function fetchAvailableDateRange(category: string): Promise<{ start: string; end: string }> {
  const endpointCategory = category === 'drought' ? 'rainfall' : category;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpointCategory}/available-range`);
  if (!res.ok) throw new Error(`Failed to load available date range for ${category}.`);
  return res.json();
}

export const MonthPicker = () => {
  const { activeCategory, selectedKey, actions } = useAppStore();
  const { data: availableRange, isLoading } = useQuery({
    queryKey: ['availableDateRange', activeCategory], // <-- DYNAMIC KEY
    queryFn: () => fetchAvailableDateRange(activeCategory!),
    enabled: !!activeCategory,
  });

  // Set default value
  useEffect(() => {
    if (availableRange && !selectedKey) {
      // Format YYYY-MM from the end date
      const defaultMonth = availableRange.end.substring(0, 7);
      actions.setSelectedKey(defaultMonth);
    }
  }, [availableRange, selectedKey, actions]);

  if (isLoading) return <p>Loading date range...</p>;

  return (
    <div>
      <label htmlFor="month-picker" className="block text-sm font-medium text-gray-700">Select Month</label>
      <input
        type="month"
        id="month-picker"
        value={selectedKey || ''}
        min={availableRange?.start.substring(0, 7)}
        max={availableRange?.end.substring(0, 7)}
        onChange={(e) => actions.setSelectedKey(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  );
};