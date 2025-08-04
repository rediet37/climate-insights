'use client';
import { useAppStore } from '@/hooks/useAppStore';
import { TimeframePicker } from './TimeframePicker';
import { RasterPickerControl } from './RasterPickerControl';
import { ClimateChart } from './ClimateChart';
import { AnomalyToggle } from './AnomalyToggle';

export function AnalysisPanel() {
  const { activeCategory, activeSubcategory, actions } = useAppStore();
  if (!activeCategory || !activeSubcategory) return null;

  const showTimeframeAndChart = !['climatology'].includes(activeSubcategory);
  const showRasterPicker = !['climatology', 'spi', 'spei'].includes(activeSubcategory);

  return (
    <div className="absolute top-4 left-4 w-[25rem] max-w-[calc(100%-2rem)] bg-white rounded-lg shadow-xl z-10 p-4 max-h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <h4 className="font-bold text-lg text-gray-800">ANALYSIS</h4>
        <button onClick={() => actions.reset()} className="text-gray-400 hover:text-gray-800" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="overflow-y-auto pr-1 space-y-6 p-1">
        {showTimeframeAndChart && (
            <div>
                <h5 className="font-semibold text-gray-800 mb-2">Analysis Timeframe</h5>
                <TimeframePicker />
            </div>
        )}
        {showRasterPicker && (
            <div>
                <h5 className="font-semibold text-gray-800 mb-2">Map Layer & Chart Focus</h5>
                <RasterPickerControl />
            </div>
        )}
        {showTimeframeAndChart && (
            <div className="h-64 mt-4"><ClimateChart /></div>
        )}
        {showRasterPicker && <AnomalyToggle />}
      </div>
    </div>
  );
}