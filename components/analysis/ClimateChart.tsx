'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/hooks/useAppStore';
import { Spinner } from '../shared/Spinner';

// Import Chart.js and react-chartjs-2 components FOR A LINE CHART
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // For the dots on the line
  LineElement,  // For the line itself
  Title,
  Tooltip,
  Legend,
  Filler,       // For the area fill under the line
} from 'chart.js';
import { Line } from 'react-chartjs-2'; // Use the Line component

// Register the necessary components for a line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define the expected shape of the API response
interface TimeseriesResponse {
  data: (number | null)[];
  period: [number, number];
}

// Helper function to construct the API query parameters
function getApiParams(timeframeStart: string, timeframeEnd: string, selectedKey: string, subcategory: string) {
    const startYear = new Date(timeframeStart).getFullYear();
    const endYear = new Date(timeframeEnd).getFullYear();
    const params = new URLSearchParams({
        start_year: String(startYear),
        end_year: String(endYear),
    });

    if (subcategory === 'daily') {
        const [_, month, day] = selectedKey.split('-');
        params.append('month', month);
        params.append('day', day);
    } else if (subcategory === 'monthly') {
        const [_, month] = selectedKey.split('-');
        params.append('month', month);
    } else if (subcategory === 'seasonal') {
        const [season, _] = selectedKey.split('-');
        params.append('season', season);
    }
    // For 'annual', only start_year and end_year are needed.
    
    return params;
}

/**
 * Renders an inter-annual comparison line chart for a specific sub-period (e.g., October)
 * over a range of years defined by the user's timeframe selection.
 */
export const ClimateChart = () => {
  const { 
    activeCategory, 
    activeSubcategory, 
    timeframeStart, 
    timeframeEnd, 
    selectedKey, 
    isAnomaly 
  } = useAppStore();

  const { data: responseData, isLoading, isError, error } = useQuery<TimeseriesResponse>({
    queryKey: ['interAnnualChart', activeCategory, activeSubcategory, timeframeStart, timeframeEnd, selectedKey, isAnomaly],
    queryFn: async () => {
      if (!activeCategory || !activeSubcategory || !timeframeStart || !timeframeEnd || !selectedKey) {
        return null;
      }
      
      const params = getApiParams(timeframeStart, timeframeEnd, selectedKey, activeSubcategory);
      if (isAnomaly) {
        params.append('anomaly', 'true');
      }

      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${activeCategory}/${activeSubcategory}/timeseries?${params.toString()}`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch chart data.`);
      return res.json();
    },
    enabled: !!activeCategory && !!activeSubcategory && !!timeframeStart && !!timeframeEnd && !!selectedKey,
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-gray-500">
        <Spinner />
        <span className="mt-2 text-sm">Loading Chart Data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex justify-center items-center text-red-600 bg-red-50 p-4 rounded-md">
        <p className="text-center text-sm">Error loading chart: <br/> {error.message}</p>
      </div>
    );
  }

  if (!responseData || !responseData.data || responseData.data.length === 0) {
    return (
      <div className="h-full flex justify-center items-center text-gray-500 text-center p-4">
        <p>No chart data available for this selection.</p>
      </div>
    );
  }

  // Generate the year labels based on the 'period' array
  const { data, period } = responseData;
  const [startYear, endYear] = period;
  const labels = Array.from({ length: endYear - startYear + 1 }, (_, i) => String(startYear + i));
  const values = data;

  if (labels.length !== values.length) {
      console.error("Mismatch between period range and data length from API.");
      return <div className="h-full flex justify-center items-center text-red-500"><p>Received malformed chart data.</p></div>;
  }
  
  const selectedYear = selectedKey?.split('-')[0];

  const lineChartData = {
    labels: labels,
    datasets: [
      {
        fill: true,
        label: `${activeCategory} data`,
        data: values,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
        // Visually highlight the point on the line corresponding to the selected year
        pointRadius: labels.map(label => label === selectedYear ? 6 : 3),
        pointBackgroundColor: labels.map(label => label === selectedYear ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)'),
        pointBorderWidth: 2,
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      },
    ],
  };

  // Helper to get the name of the sub-period for the title
  const getSubPeriodName = () => {
    if (!selectedKey || !activeSubcategory) return '';
    if (activeSubcategory === 'monthly') {
        const monthIndex = parseInt(selectedKey.split('-')[1], 10) - 1;
        return new Date(0, monthIndex).toLocaleString('en-US', { month: 'long' });
    }
    if (activeSubcategory === 'seasonal') {
        return selectedKey.split('-')[0];
    }
    // Add logic for daily if needed
    return '';
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${activeSubcategory?.charAt(0).toUpperCase() + activeSubcategory!.slice(1)} ${activeCategory} for ${getSubPeriodName()}`,
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
            title: function (context: any) {
                return `${getSubPeriodName()} ${context[0].label}`;
            },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Year' } },
      y: { title: { display: true, text: isAnomaly ? 'Anomaly Value' : 'Value' } },
    },
  };

  return <Line options={chartOptions as any} data={lineChartData} />;
};