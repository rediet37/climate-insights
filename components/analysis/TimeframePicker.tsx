'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/hooks/useAppStore';
import { useEffect, useState } from 'react';
import { Spinner } from '../shared/Spinner';

async function fetchAvailableDateRange() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/available-range`);
  if (!res.ok) throw new Error('Failed to load available date range.');
  return res.json() as Promise<{ start: string; end: string }>;
}

export const TimeframePicker = () => {
  const { timeframeStart, timeframeEnd, actions } = useAppStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: availableRange, isLoading } = useQuery({
    queryKey: ['availableDateRange'],
    queryFn: fetchAvailableDateRange,
    staleTime: Infinity, // This data is static for the session.
  });

  useEffect(() => {
    if (availableRange && !timeframeStart && !timeframeEnd) {
      const endDate = new Date(availableRange.end);
      const startDate = new Date(availableRange.end);
      startDate.setFullYear(endDate.getFullYear() - 5);
      
      const defaultStart = startDate < new Date(availableRange.start) 
        ? availableRange.start 
        : startDate.toISOString().split('T')[0];
        
      actions.setTimeframe(defaultStart, availableRange.end);
    }
  }, [availableRange, timeframeStart, timeframeEnd, actions]);

  const handleDateChange = (start: string | null, end: string | null) => {
    setLocalError(null);
    if (start && end && new Date(start) > new Date(end)) {
      setLocalError('Start date cannot be after end date.');

    }
    actions.setTimeframe(start, end);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Spinner />
        <span>Loading Timeframe...</span>
      </div>
    );
  }
  
  if (!availableRange) {
    return <div className="text-red-500 text-sm">Could not load timeframe controls.</div>;
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg border">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="start-date"
            value={timeframeStart || ''}
            min={availableRange.start}
            max={availableRange.end}
            onChange={(e) => handleDateChange(e.target.value, timeframeEnd)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="end-date"
            value={timeframeEnd || ''}
            min={availableRange.start}
            max={availableRange.end}
            onChange={(e) => handleDateChange(timeframeStart, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      {localError && <p className="text-red-500 text-xs mt-2">{localError}</p>}
    </div>
  );
};
