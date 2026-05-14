'use client';

import { useAppStore } from '@/hooks/useAppStore';
import { AdminLevel } from '@/data';

const adminLevelOptions: { value: AdminLevel; label: string; description: string }[] = [
  { value: 'nationwide', label: 'Nationwide', description: 'View entire Ethiopia' },
  { value: 'region', label: 'Regions', description: 'Select by region (ADM1)' },
  { value: 'woreda', label: 'Woredas', description: 'Select by woreda (ADM3)' },
];

/**
 * AdminLevelPicker
 * A floating control that allows users to switch between viewing
 * nationwide, regions, or woredas boundaries on the map.
 */
export function AdminLevelPicker() {
  const { adminLevel, actions } = useAppStore();

  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Analysis Level
        </div>
        <div className="flex flex-col gap-1">
          {adminLevelOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => actions.setAdminLevel(option.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                adminLevel === option.value
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title={option.description}
            >
              {/* Icon based on level */}
              {option.value === 'nationwide' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {option.value === 'region' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              )}
              {option.value === 'woreda' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              )}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
