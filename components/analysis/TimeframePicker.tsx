// Controls the analysis time window. Fetches available date range per category
// and lets users set start/end (or year range for climatology).
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/hooks/useAppStore';
import { useEffect, useState } from 'react';
import { Spinner } from '../shared/Spinner';

async function fetchAvailableDateRange(category: string): Promise<{ start: string; end: string }> {
  // Backend uses rainfall range for drought indices
  const endpointCategory = category === 'drought' ? 'rainfall' : category;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpointCategory}/available-range`);
  if (!res.ok) throw new Error(`Failed to load available date range for ${category}.`);

  // Normalize year-only responses to full dates
  const rangeData = await res.json();
  if (rangeData.end && String(rangeData.end).length === 4) {
    rangeData.end = `${rangeData.end}-12-31`;
  }
  if (rangeData.start && String(rangeData.start).length === 4) {
    rangeData.start = `${rangeData.start}-01-01`;
  }

  return rangeData;
}

/**
 * TimeframePicker
 * - Loads the available date range for the current category
 * - Defaults to a 5-year window ending at the latest available date
 * - For climatology: uses numeric year inputs and maps to full dates
 */
export const TimeframePicker = () => {
  const { activeCategory, activeSubcategory, timeframeStart, timeframeEnd, actions } = useAppStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const isClimatology = activeSubcategory === 'climatology';

  const { data: availableRange, isLoading } = useQuery({
    queryKey: ['availableDateRange', activeCategory],
    queryFn: () =>fetchAvailableDateRange(activeCategory!),
    enabled: !!activeCategory, // Only run the query when a category is selected
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

  // For climatology, we need year inputs
  const getYearFromDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).getFullYear().toString();
  };
  
  // Set the date to first/last day of the year for climatology
  const handleYearChange = (isStart: boolean, year: string) => {
    if (!year || isNaN(parseInt(year))) return;
    
    const startYear = isStart ? parseInt(year) : timeframeStart ? new Date(timeframeStart).getFullYear() : null;
    const endYear = !isStart ? parseInt(year) : timeframeEnd ? new Date(timeframeEnd).getFullYear() : null;
    
    if (startYear && endYear && startYear > endYear) {
      setLocalError('Start year cannot be after end year.');
      return;
    }
    
    const startDate = startYear ? `${startYear}-01-01` : null;
    const endDate = endYear ? `${endYear}-12-31` : null;
    
    actions.setTimeframe(startDate, endDate);
    setLocalError(null);
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

  // Extract available years for climatology
  const availableStartYear = availableRange ? new Date(availableRange.start).getFullYear() : undefined;
  const availableEndYear = availableRange ? new Date(availableRange.end).getFullYear() : undefined;

  // For climatology, show year pickers
  if (isClimatology) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border">
        <p className="text-sm text-gray-600 mb-3">
          Select a range of years to calculate climatology averages.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-year" className="block text-sm font-medium text-gray-700">
              Start Year
            </label>
            <input
              type="number"
              id="start-year"
              value={getYearFromDate(timeframeStart)}
              min={availableStartYear}
              max={availableEndYear}
              onChange={(e) => handleYearChange(true, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="end-year" className="block text-sm font-medium text-gray-700">
              End Year
            </label>
            <input
              type="number"
              id="end-year"
              value={getYearFromDate(timeframeEnd)}
              min={availableStartYear}
              max={availableEndYear}
              onChange={(e) => handleYearChange(false, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        {localError && <p className="text-red-500 text-xs mt-2">{localError}</p>}
      </div>
    );
  }
  
  // For regular subcategories, show date pickers
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
