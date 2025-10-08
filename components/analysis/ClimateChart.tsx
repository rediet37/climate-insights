'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore, SelectedGeometry } from '@/hooks/useAppStore';
import { Spinner } from '../shared/Spinner';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TimeseriesResponse {
  data: (number | null)[];
  period: [number, number];
}

export const ClimateChart = () => {
  const {
    activeCategory,
    activeSubcategory,
    timeframeStart,
    timeframeEnd,
    selectedKey,
    isAnomaly,
    selectedGeometry
  } = useAppStore();

  const { data: responseData, isLoading, isError, error } = useQuery<TimeseriesResponse>({
    queryKey: ['interAnnualChart', activeCategory, activeSubcategory, timeframeStart, timeframeEnd, selectedKey, isAnomaly, selectedGeometry],
    queryFn: async () => {
      if (!activeCategory || !activeSubcategory || !timeframeStart || !timeframeEnd || !selectedKey) {
        return null;
      }

      const startYear = new Date(timeframeStart).getFullYear();
      const endYear = new Date(timeframeEnd).getFullYear();
      const params: any = {
        start_year: String(startYear),
        end_year: String(endYear),
      };

      // Daily-like (include month & day) for standard daily plus drought daily indices cdd/cwd
      if (activeSubcategory === 'daily' || activeSubcategory === 'cdd' || activeSubcategory === 'cwd') {
        const [_, month, day] = selectedKey.split('-');
        params.month = month;
        params.day = day;
      // Monthly-like (single month across all years) for standard monthly plus spi/spei
      } else if (activeSubcategory === 'monthly' || activeSubcategory === 'spi' || activeSubcategory === 'spei') {
        const [_, month] = selectedKey.split('-');
        params.month = month;
      } else if (activeSubcategory === 'seasonal') {
        const [season, _] = selectedKey.split('-');
        params.season = season;
      }

      if (isAnomaly) {
        params.anomaly = true;
      }

      const requestBody: { params: any; region?: string; geometry?: any } = {
        params: params,
      };

      if (selectedGeometry) {
        if (selectedGeometry.type === 'region' && selectedGeometry.name) {
          // Use the 'name' property as requested by the backend ---
          requestBody.params.region = selectedGeometry.name;
        } else if (selectedGeometry.type === 'custom') {
          requestBody.geometry = selectedGeometry.geometry;
        }
      }

      const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${activeCategory}/${activeSubcategory}/timeseries`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error(`Failed to fetch chart data.`);
      return res.json();
    },
    enabled: !!activeCategory && !!activeSubcategory && !!timeframeStart && !!timeframeEnd && !!selectedKey,
    retry: false,
  });

  if (isLoading) {
    return <div className="h-full flex flex-col justify-center items-center text-gray-500"><Spinner /><span className="mt-2 text-sm">Loading Chart Data...</span></div>;
  }

  if (isError) {
    return <div className="h-full flex justify-center items-center text-red-600 bg-red-50 p-4 rounded-md"><p className="text-center text-sm">Error loading chart: <br /> Please try a different selection.</p></div>;
  }

  if (!responseData || !responseData.data || responseData.data.length === 0) {
    return <div className="h-full flex justify-center items-center text-gray-500 text-center p-4"><p>No chart data available for this selection.</p></div>;
  }

  const { data, period } = responseData;
  const [startYear, endYear] = period;
  const labels = Array.from({ length: endYear - startYear + 1 }, (_, i) => String(startYear + i));
  const values = data;

  if (labels.length !== values.length) {
    console.error("API data mismatch: period and data length are inconsistent.");
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
        pointRadius: labels.map(label => label === selectedYear ? 6 : 3),
        pointBackgroundColor: labels.map(label => label === selectedYear ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)'),
        pointBorderWidth: 2,
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      },
    ],
  };

  const getSubPeriodName = () => {
    if (!selectedKey || !activeSubcategory) return '';
  if (activeSubcategory === 'monthly' || activeSubcategory === 'spi' || activeSubcategory === 'spei') {
      const monthIndex = parseInt(selectedKey.split('-')[1], 10) - 1;
      return new Date(0, monthIndex).toLocaleString('en-US', { month: 'long' });
    }
    if (activeSubcategory === 'seasonal') {
      return selectedKey.split('-')[0];
    }
    return '';
  };

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
          title: (context: any) => `${getSubPeriodName()} ${context[0].label}`,
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