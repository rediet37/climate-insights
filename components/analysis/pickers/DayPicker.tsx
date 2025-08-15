'use client';
import { useAppStore } from '@/hooks/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

// This is now the ONLY config data the pickers need.
async function fetchAvailableDateRange(category: string): Promise<{ start: string; end: string }> {
  const endpointCategory = category === 'drought' ? 'rainfall' : category;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpointCategory}/available-range`);
  if (!res.ok) throw new Error(`Failed to load available date range for ${category}.`);
  return res.json();
}

export const DayPicker = () => {
  const { activeCategory, selectedKey, actions } = useAppStore();
  const { data: availableRange, isLoading } = useQuery({
    queryKey: ['availableDateRange', activeCategory],
    queryFn: () => fetchAvailableDateRange(activeCategory!),
    enabled: !!activeCategory, // Only run the query when a category is selected
    staleTime: Infinity,
  });

  // Set a default value (the most recent available day) when the component loads.
  useEffect(() => {
    if (availableRange && !selectedKey) {
      actions.setSelectedKey(availableRange.end);
    }
  }, [availableRange, selectedKey, actions]);

  if (isLoading) return <p>Loading date range...</p>;

  return (
    <div>
      <label htmlFor="day-picker" className="block text-sm font-medium text-gray-700">Select Date</label>
      <input
        type="date"
        id="day-picker"
        value={selectedKey || ''}
        // Set min/max to prevent users from picking wildly out-of-range dates.
        min={availableRange?.start}
        max={availableRange?.end}
        onChange={(e) => actions.setSelectedKey(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  );
};