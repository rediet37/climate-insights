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

  // --- Add content for all other subcategories here ---
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

  // Add more entries...
};