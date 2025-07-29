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
    <div className="flex items-center justify-center space-x-3 mt-4 p-3 border-t border-gray-200">
      <label htmlFor="anomaly-toggle" className="font-medium text-gray-700">
        Show Anomaly
      </label>
      <ToggleSwitch
        id="anomaly-toggle"
        checked={isAnomaly}
        onChange={(checked) => actions.setAnomaly(checked)}
      />
    </div>
  );
};