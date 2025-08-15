'use client';
import { useAppStore } from '@/hooks/useAppStore';
import { TimeframePicker } from './TimeframePicker';
import { RasterPickerControl } from './RasterPickerControl';
import { ClimateChart } from './ClimateChart';
import { AnomalyToggle } from './AnomalyToggle';

export function AnalysisPanel() {
  const { activeCategory, activeSubcategory, selectedGeometry, actions } = useAppStore();
  if (!activeCategory || !activeSubcategory) return null;

  const showTimeframeAndChart = !['climatology'].includes(activeSubcategory);
  const showRasterPicker = !['climatology', 'spi', 'spei'].includes(activeSubcategory);

  // Format region name for display
  const getRegionDisplayName = () => {
    if (!selectedGeometry) return null;
    
    if (selectedGeometry.type === 'region') {
      // Check to see if the selectedRegion is in the format used in et.json (like "ETTI" for Tigray)
      // In a real app, you'd probably have a mapping or lookup from the geojson itself
      const regionMap: Record<string, string> = {
        'ETTI': 'Tigray',
        'ETAM': 'Amhara',
        'ETOR': 'Oromia',
        'ETSN': 'Southern Nations',
        'ETSO': 'Somali',
        'ETAF': 'Afar',
        'ETBE': 'Benishangul-Gumuz',
        'ETGA': 'Gambela',
        'ETHA': 'Harari',
        'ETAA': 'Addis Ababa',
        'ETDD': 'Dire Dawa'
      };
      
      return selectedGeometry.name || regionMap[selectedGeometry.id!] || selectedGeometry.id;
    } else {
      // For custom drawn areas
      return selectedGeometry.name || 'Custom Area';
    }
  };

  return (
    <div className="absolute top-4 left-4 w-[25rem] max-w-[calc(100%-2rem)] bg-white rounded-lg shadow-xl z-10 p-4 max-h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <h4 className="font-bold text-lg text-gray-800">
          {selectedGeometry 
            ? `${getRegionDisplayName()} ANALYSIS` 
            : 'NATIONWIDE ANALYSIS'}
        </h4>
        <button onClick={() => actions.reset()} className="text-gray-400 hover:text-gray-800" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      {/* Region selection banner */}
      {selectedGeometry && (
        <div className="bg-blue-50 p-2 mb-4 rounded-md flex justify-between items-center">
          <span className="text-blue-800 text-sm">
            {selectedGeometry.type === 'region' 
              ? `Viewing data for ${getRegionDisplayName()} region` 
              : 'Viewing data for custom area'}
          </span>
          <button 
            onClick={() => actions.setSelectedGeometry(null)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            <span>Back to Nationwide</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
      
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