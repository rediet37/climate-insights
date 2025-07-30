import React from 'react';

// A helper component to create the structured info rows
const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b py-3">
    <dt className="font-semibold text-gray-800">{label}</dt>
    <dd className="md:col-span-3 text-gray-600">{children}</dd>
  </div>
);

// A map containing the JSX content for each subcategory's modal.
export const infoContent: Record<string, { title: string; content: React.ReactNode }> = {
  // --- RAINFALL ---
  'rainfall-daily': {
    title: 'Daily Rainfall Information',
    content: (
      <div>
        <InfoRow label="Function">
          Provides the total accumulated rainfall for a given 24-hour period.
        </InfoRow>
        <InfoRow label="Resolution">~10 KM by 10 KM</InfoRow>
        <InfoRow label="Source">
          CHIRPS (Climate Hazards Group InfraRed Precipitation with Station data).
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          This dataset provides a high-resolution view of daily precipitation, which is essential for monitoring short-term weather events, agricultural planning, and flash flood risk assessment.
        </p>
      </div>
    ),
  },
  'rainfall-monthly': {
    title: 'Monthly Rainfall Information',
    content: (
      <div>
        <InfoRow label="Function">
          Calculates the total accumulated rainfall for each calendar month.
        </InfoRow>
        <InfoRow label="Resolution">~10 KM by 10 KM</InfoRow>
        <InfoRow label="Source">
          CHIRPS (Climate Hazards Group InfraRed Precipitation with Station data).
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          Monthly rainfall data is crucial for seasonal agricultural planning, water resource management, and understanding medium-term climate patterns. It smooths out daily variability to reveal broader precipitation trends.
        </p>
      </div>
    ),
  },
  'rainfall-seasonal': {
    title: 'Seasonal Rainfall Information',
    content: (
      <div>
        <InfoRow label="Function">
          Accumulates rainfall data over meteorological seasons (e.g., DJF, MAM, JJA, SON).
        </InfoRow>
        <InfoRow label="Resolution">~10 KM by 10 KM</InfoRow>
        <InfoRow label="Source">
          CHIRPS (Climate Hazards Group InfraRed Precipitation with Station data).
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          Seasonal rainfall analysis helps identify wet and dry seasons, monitor their intensity and duration, and track shifts in seasonal patterns that might be related to climate change. This is particularly important for agricultural planning and water resource management.
        </p>
      </div>
    ),
  },
  'rainfall-annual': {
    title: 'Annual Rainfall Information',
    content: (
      <div>
        <InfoRow label="Function">
          Calculates the total accumulated rainfall for each calendar year.
        </InfoRow>
        <InfoRow label="Resolution">~10 KM by 10 KM</InfoRow>
        <InfoRow label="Source">
          CHIRPS (Climate Hazards Group InfraRed Precipitation with Station data).
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          Annual rainfall totals are essential for understanding long-term climate patterns, evaluating drought or excess rainfall years, and assessing trends in precipitation that might be linked to climate change. This information supports long-term planning for agriculture, water management, and infrastructure development.
        </p>
      </div>
    ),
  },
  'rainfall-climatology': {
    title: 'Rainfall Climatology Information',
    content: (
       <div>
        <InfoRow label="Function">
          Represents the long-term average rainfall, typically calculated over a 30-year baseline period (e.g., 1991-2020).
        </InfoRow>
        <InfoRow label="Usage">
          It serves as a baseline to determine if current weather patterns are normal, wetter, or drier than average. Anomaly data is calculated by subtracting this climatology value from the observed data.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          Climatology is the foundation of climate analysis. Understanding the long-term average helps in identifying climate change trends and extreme weather events.
        </p>
      </div>
    )
  },

  // --- TEMPERATURE ---
  'temperature-daily': {
    title: 'Daily Temperature Information',
    content: (
      <div>
        <InfoRow label="Function">
          Provides average, minimum, and maximum temperature values for a 24-hour period.
        </InfoRow>
        <InfoRow label="Resolution">~25 KM by 25 KM</InfoRow>
        <InfoRow label="Source">
          ERA5 Reanalysis Dataset from ECMWF.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          Daily temperature data is essential for monitoring immediate weather conditions, heat or cold waves, and day-to-day agricultural management. This high-temporal resolution data captures the diurnal temperature cycle and short-term fluctuations.
        </p>
      </div>
    ),
  },
  'temperature-monthly': {
    title: 'Monthly Average Temperature Information',
    content: (
      <div>
        <InfoRow label="Function">
          Calculates the average temperature over each calendar month.
        </InfoRow>
        <InfoRow label="Resolution">~25 KM by 25 KM</InfoRow>
        <InfoRow label="Source">
          ERA5 Reanalysis Dataset from ECMWF.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          Monthly temperature averages smooth out daily variations to reveal medium-term temperature patterns. This data is useful for seasonal planning in agriculture, energy demand forecasting, and identifying unusual warm or cold months compared to historical records.
        </p>
      </div>
    ),
  },
  'temperature-seasonal': {
    title: 'Seasonal Temperature Information',
    content: (
      <div>
        <InfoRow label="Function">
          Averages temperature data over meteorological seasons (e.g., DJF, MAM, JJA, SON).
        </InfoRow>
        <InfoRow label="Resolution">~25 KM by 25 KM</InfoRow>
        <InfoRow label="Source">
          ERA5 Reanalysis Dataset from ECMWF.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          Seasonal temperature analysis helps identify temperature patterns across different parts of the year, track seasonal warming or cooling trends, and support long-term planning for agriculture, energy, and public health interventions related to seasonal temperature extremes.
        </p>
      </div>
    ),
  },
  'temperature-annual': {
    title: 'Annual Average Temperature Information',
    content: (
      <div>
        <InfoRow label="Function">
          Calculates the average of the mean daily temperatures over a full calendar year.
        </InfoRow>
        <InfoRow label="Resolution">~25 KM by 25 KM</InfoRow>
        <InfoRow label="Source">
          ERA5 Reanalysis Dataset from ECMWF.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          Annual average temperature is a key indicator for monitoring long-term climate trends and global warming. Comparing annual averages over decades reveals significant patterns of climate change.
        </p>
      </div>
    ),
  },
  'temperature-climatology': {
    title: 'Temperature Climatology Information',
    content: (
      <div>
        <InfoRow label="Function">
          Represents the long-term average temperature, typically calculated over a 30-year baseline period (e.g., 1991-2020).
        </InfoRow>
        <InfoRow label="Usage">
          Serves as a baseline to determine if current temperature patterns are normal, warmer, or cooler than average. Temperature anomalies are calculated by subtracting this climatology value from observed temperatures.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          Temperature climatology provides the expected "normal" temperature for a location and time period. It's essential for climate monitoring, detecting temperature anomalies, and understanding regional climate characteristics.
        </p>
      </div>
    ),
  },

  // --- DROUGHT ---
  'drought-cdd': {
    title: 'Consecutive Dry Days (CDD) Information',
    content: (
      <div>
        <InfoRow label="Function">
          Counts the maximum number of consecutive days with precipitation below a specified threshold (typically 1mm).
        </InfoRow>
        <InfoRow label="Significance">
          A higher CDD value indicates longer dry spells and potential drought conditions.
        </InfoRow>
        <InfoRow label="Source">
          Derived from CHIRPS daily precipitation data.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          CDD is a simple but effective drought indicator that directly measures dry spell length. It's particularly useful for agricultural planning, as extended dry periods can severely impact crop growth even if seasonal rainfall totals are normal.
        </p>
      </div>
    ),
  },
  'drought-cwd': {
    title: 'Consecutive Wet Days (CWD) Information',
    content: (
      <div>
        <InfoRow label="Function">
          Counts the maximum number of consecutive days with precipitation above a specified threshold (typically 1mm).
        </InfoRow>
        <InfoRow label="Significance">
          A higher CWD value indicates longer wet spells and potentially waterlogged conditions.
        </InfoRow>
        <InfoRow label="Source">
          Derived from CHIRPS daily precipitation data.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          CWD helps identify periods of persistent rainfall that could lead to flooding, waterlogging, or delayed planting/harvesting. It's complementary to CDD and together they provide insights into precipitation patterns beyond simple rainfall totals.
        </p>
      </div>
    ),
  },
  'drought-spi': {
    title: 'Standardized Precipitation Index (SPI) Information',
    content: (
      <div>
        <InfoRow label="Function">
          Quantifies precipitation deficit or excess over different timescales (typically 1, 3, 6, 12, or 24 months).
        </InfoRow>
        <InfoRow label="Interpretation">
          Negative SPI values indicate drought conditions, while positive values indicate wet conditions. Values typically range from -3 (extreme drought) to +3 (extremely wet).
        </InfoRow>
        <InfoRow label="Source">
          Calculated from CHIRPS precipitation data.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          SPI is a widely used drought index that normalizes precipitation data, allowing for comparisons across different climate regimes. Its multi-timescale approach helps distinguish between short-term (meteorological) droughts and longer-term (agricultural or hydrological) droughts.
        </p>
      </div>
    ),
  },
  'drought-spei': {
    title: 'Standardized Precipitation Evapotranspiration Index (SPEI) Information',
    content: (
      <div>
        <InfoRow label="Function">
          Similar to SPI but incorporates temperature effects by using the difference between precipitation and potential evapotranspiration.
        </InfoRow>
        <InfoRow label="Interpretation">
          Like SPI, negative SPEI values indicate drought conditions and positive values indicate wet conditions, but SPEI also accounts for temperature-driven water demand.
        </InfoRow>
        <InfoRow label="Source">
          Calculated from CHIRPS precipitation data and ERA5 temperature data.
        </InfoRow>
        <h4 className="font-bold mt-6 mb-2 text-lg">Overview</h4>
        <p className="text-gray-600">
          SPEI is an advanced drought index that accounts for both water supply (precipitation) and demand (evapotranspiration). This makes it particularly valuable in a warming climate, where rising temperatures can exacerbate drought conditions even without changes in precipitation.
        </p>
      </div>
    ),
  },
};