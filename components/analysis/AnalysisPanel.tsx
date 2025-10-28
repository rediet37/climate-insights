// Analysis overlay that appears over the map when a category/subcategory is active.
'use client';
import { useAppStore } from '@/hooks/useAppStore';
import { TimeframePicker } from './TimeframePicker';
import { RasterPickerControl } from './RasterPickerControl';
import { ClimateChart } from './ClimateChart';
import { MonthPicker } from './pickers/MonthPicker';
import { AnomalyToggle } from './AnomalyToggle';
import { ClimatologyDisplay } from './ClimatologyDisplay';
import { WiRain, WiThermometer } from 'react-icons/wi';
import { IoSunnyOutline } from "react-icons/io5";

/**
 * AnalysisPanel
 * Shows timeframe, raster/season/month pickers, optional anomaly toggle, and the chart.
 * Only renders when both activeCategory and activeSubcategory are set.
 */
export function AnalysisPanel() {
  const { activeCategory, activeSubcategory, selectedGeometry, isAnomaly, actions } = useAppStore();
  if (!activeCategory || !activeSubcategory) return null;

  // Raster picker is hidden for SPI/SPEI/climatology
  const showRasterPicker = !['spi', 'spei', 'climatology'].includes(activeSubcategory);
  // Exclude anomaly toggle for CDD/CWD indices
  const showAnomalyToggle = showRasterPicker && !['cdd', 'cwd'].includes(activeSubcategory);

  // Clear anomaly when switching into CDD/CWD (those endpoints ignore anomaly)
  if (['cdd', 'cwd'].includes(activeSubcategory) && isAnomaly) {
    // Fire-and-forget synchronous state update; harmless in render since condition short-circuits after toggle
    actions.setAnomaly(false);
  }
  
  // Hide chart for climatology mode
  const showChart = activeSubcategory !== 'climatology';

  // Format region name for display in the header
  const getRegionDisplayName = () => {
    if (!selectedGeometry) return null;
    
    if (selectedGeometry.type === 'region') {
  // Map common region codes (from et.json) to display names
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
    <div className="absolute top-4 left-4 w-[26rem] max-w-[calc(100%-2rem)] bg-white rounded-xl shadow-2xl z-10 overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col backdrop-blur-sm backdrop-filter">
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-5 py-4 flex justify-between items-center flex-shrink-0">
        <h4 className="font-bold text-lg flex items-center">
          {activeCategory === 'rainfall' && <WiRain className="mr-2" size={24} />}
          {activeCategory === 'temperature' && <WiThermometer className="mr-2" size={24} />}
          {activeCategory === 'drought' && <IoSunnyOutline className="mr-2" size={22} />}
          {selectedGeometry 
            ? `${getRegionDisplayName()} ANALYSIS` 
            : 'NATIONWIDE ANALYSIS'}
        </h4>
        <button 
          onClick={() => actions.reset()} 
          className="text-white bg-white/20 rounded-full p-1.5 hover:bg-white/30 transition-colors duration-200" 
          title="Close Analysis Panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      {/* Region selection banner */}
      {selectedGeometry && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 flex justify-between items-center border-b border-blue-100">
          <span className="text-blue-800 font-medium flex items-center">
            {selectedGeometry.type === 'region' 
              ? <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {getRegionDisplayName()} Region
                </>
              : <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Custom Area Selection
                </>
            }
          </span>
          <button 
            onClick={() => actions.setSelectedGeometry(null)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center bg-white/70 hover:bg-white px-3 py-1.5 rounded-lg transition-colors duration-200"
          >
            <span>View Nationwide</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="overflow-y-auto px-5 py-4 space-y-6">
        {/* Timeframe picker - Always visible for all subcategories */}
        <div className="bg-white/40 rounded-xl p-4 shadow-sm border border-gray-100">
            <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {activeSubcategory === 'climatology' ? 'Climatology Timeframe' : 'Analysis Timeframe'}
            </h5>
            <TimeframePicker />
        </div>

        {/* Climatology Display */}
        {activeSubcategory === 'climatology' && (
          <div className="bg-white/40 rounded-xl p-4 shadow-sm border border-gray-100">
            <ClimatologyDisplay />
          </div>
        )}
        
        {/* Raster picker for non-climatology, non-spi, non-spei subcategories */}
        {showRasterPicker && (
            <div className="bg-white/40 rounded-xl p-4 shadow-sm border border-gray-100">
                <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
                  </svg>
                  Map Layer & Chart Focus
                </h5>
                <RasterPickerControl />
            </div>
        )}

        {/* Month picker for SPI / SPEI (no raster) */}
        {['spi','spei'].includes(activeSubcategory) && (
          <div className="bg-white/40 rounded-xl p-4 shadow-sm border border-gray-100">
            <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
              </svg>
              Chart Focus
            </h5>
            <MonthPicker />
          </div>
        )}
        
        {/* Chart - Only show for non-climatology */}
        {showChart && (
          <div className="bg-white/40 rounded-xl p-4 shadow-sm border border-gray-100 h-72">
            <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Temporal Analysis
            </h5>
            <ClimateChart />
          </div>
        )}
        
        
  {/* Anomaly toggle (hidden for cdd & cwd) */}
  {showAnomalyToggle && (
          <div className="bg-white/40 rounded-xl p-4 shadow-sm border border-gray-100">
            <AnomalyToggle />
          </div>
        )}
      </div>
    </div>
  );
}