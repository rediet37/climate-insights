'use client';
import { useAppStore } from '@/hooks/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

const SEASONS = [
  { key: 'MAM', name: 'MAM (Mar-Apr-May)' },
  { key: 'JJAS', name: 'JJAS (Jun-Jul-Aug-Sep)' },
  { key: 'OND', name: 'OND (Oct-Nov-Dec)' },
];

async function fetchAvailableDateRange() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/available-range`);
  if (!res.ok) throw new Error('Failed to load available date range.');
  return res.json() as Promise<{ start: string; end: string }>;
}

export const SeasonPicker = () => {
  const { selectedKey, actions } = useAppStore();
  const { data: availableRange, isLoading } = useQuery({
    queryKey: ['availableDateRange'],
    queryFn: fetchAvailableDateRange,
  });

  // A year dropdown and a season dropdown.
  const currentYear = selectedKey ? selectedKey.split('-')[1] : '';
  const currentSeasonKey = selectedKey ? selectedKey.split('-')[0] : '';

  // Get the range of years available for the dropdown
  const yearRange = useMemo(() => {
    if (!availableRange) return [];
    const startYear = new Date(availableRange.start).getFullYear();
    const endYear = new Date(availableRange.end).getFullYear();
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, [availableRange]);

  // Set default value
  useEffect(() => {
    if (yearRange.length > 0 && !selectedKey) {
      // Default to the Kiremt season of the most recent year
      const defaultYear = yearRange[yearRange.length - 1];
      const defaultSeason = 'JJAS';
      actions.setSelectedKey(`${defaultSeason}-${defaultYear}`);
    }
  }, [yearRange, selectedKey, actions]);
  
  const handleYearChange = (year: string) => {
    const season = currentSeasonKey || 'JJAS'; // Default to a season if none is selected
    actions.setSelectedKey(`${season}-${year}`);
  };

  const handleSeasonChange = (seasonKey: string) => {
    const year = currentYear || yearRange[yearRange.length - 1]; // Default to a year
    actions.setSelectedKey(`${seasonKey}-${year}`);
  };

  if (isLoading) return <p>Loading date range...</p>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Season Dropdown */}
      <div>
        <label htmlFor="season-select" className="block text-sm font-medium text-gray-700">Season</label>
        <select
          id="season-select"
          value={currentSeasonKey}
          onChange={(e) => handleSeasonChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {SEASONS.map(season => (
            <option key={season.key} value={season.key}>{season.name}</option>
          ))}
        </select>
      </div>

      {/* Year Dropdown */}
      <div>
        <label htmlFor="year-select-season" className="block text-sm font-medium text-gray-700">Year</label>
        <select
          id="year-select-season"
          value={currentYear}
          onChange={(e) => handleYearChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {yearRange.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
};