'use client';

import { useAppStore } from '@/hooks/useAppStore';
import { ToggleSwitch } from '../shared/ToggleSwitch';

/**
 * Renders the "Show Anomaly" toggle switch and connects its state
 * to the global Zustand store.
 */
export const AnomalyToggle = () => {
  const { isAnomaly, actions } = useAppStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <label htmlFor="anomaly-toggle" className="font-medium text-gray-700">
          Show Anomaly
        </label>
      </div>
      <div className="relative">
        <ToggleSwitch
          id="anomaly-toggle"
          checked={isAnomaly}
          onChange={(checked) => actions.setAnomaly(checked)}
        />

      </div>
    </div>
  );
};