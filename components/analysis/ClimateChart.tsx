// Renders a line chart (react-chartjs-2) for the selected period and key.
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/hooks/useAppStore';
import { Spinner } from '../shared/Spinner';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TimeseriesResponse {
  data: (number | null)[];
  period: [number, number];
}

/**
 * ClimateChart
 * Fetches inter-annual timeseries for the current selection and renders line chart.
 * Query key includes category/subcategory/timeframe/selection/anomaly/geometry to ensure proper caching.
 */
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

  const { data: responseData, isLoading, isError} = useQuery<TimeseriesResponse>({
    queryKey: ['interAnnualChart', activeCategory, activeSubcategory, timeframeStart, timeframeEnd, selectedKey, isAnomaly, selectedGeometry],
    queryFn: async () => {
      if (!activeCategory || !activeSubcategory || !timeframeStart || !timeframeEnd || !selectedKey) {
        return null;
      }

      const startYear = new Date(timeframeStart).getFullYear();
      const endYear = new Date(timeframeEnd).getFullYear();
      const params: Record<string, string | boolean> = {
        start_year: String(startYear),
        end_year: String(endYear),
      };

      // Daily-like (include month & day) for standard daily plus drought daily indices cdd/cwd
      if (activeSubcategory === 'daily' || activeSubcategory === 'cdd' || activeSubcategory === 'cwd') {
        const [, month, day] = selectedKey.split('-');
        params.month = month;
        params.day = day;
      // Monthly-like (single month across all years) for standard monthly plus spi/spei
      } else if (activeSubcategory === 'monthly' || activeSubcategory === 'spi' || activeSubcategory === 'spei') {
        const [, month] = selectedKey.split('-');
        params.month = month;
      } else if (activeSubcategory === 'seasonal') {
        const [season] = selectedKey.split('-');
        params.season = season;
      }

      if (isAnomaly) {
        params.anomaly = true;
      }

      const requestBody: { params: Record<string, string | boolean>; region?: string; geometry?: unknown } = {
        params,
      };

      if (selectedGeometry) {
        if (selectedGeometry.type === 'region' && selectedGeometry.name) {
          // The region name string on params is sent to the backend instead of the region ID
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

  // Category-specific color palette 
  type ColorSet = { line: string; fill: string; point: string; highlight: string };
  const palette: { rainfall: ColorSet; temperature: ColorSet; droughtAmber: ColorSet; droughtGreen: ColorSet } = {
    rainfall: {
      line: 'rgb(54, 162, 235)',          // blue
      fill: 'rgba(54, 162, 235, 0.2)',
      point: 'rgb(54, 162, 235)',
      highlight: 'rgb(30, 144, 255)',     // dodger blue
    },
    temperature: {
      line: 'rgb(234, 67, 53)',           // red
      fill: 'rgba(234, 67, 53, 0.2)',
      point: 'rgb(234, 67, 53)',
      highlight: 'rgb(255, 99, 132)',     // pinkish highlight
    },
    droughtAmber: {
      line: 'rgb(245, 158, 11)',          // amber-500 (CDD, SPI, SPEI)
      fill: 'rgba(245, 158, 11, 0.2)',
      point: 'rgb(245, 158, 11)',
      highlight: 'rgb(217, 119, 6)',      // amber-600
    },
    droughtGreen: {
      line: 'rgb(16, 185, 129)',          // emerald-500 (CWD)
      fill: 'rgba(16, 185, 129, 0.2)',
      point: 'rgb(16, 185, 129)',
      highlight: 'rgb(5, 150, 105)',      // emerald-600
    },
  };

  let colors: ColorSet = palette.rainfall;
  if (activeCategory === 'rainfall') {
    colors = palette.rainfall;
  } else if (activeCategory === 'temperature') {
    colors = palette.temperature;
  } else if (activeCategory === 'drought') {
    if (activeSubcategory === 'cwd') {
      colors = palette.droughtGreen;
    } else {
      colors = palette.droughtAmber;
    }
  }

  const lineChartData = {
    labels: labels,
    datasets: [
      {
        fill: true,
        label: `${activeCategory} data`,
        data: values,
        borderColor: colors.line,
        backgroundColor: colors.fill,
        tension: 0.1,
        pointRadius: labels.map(label => label === selectedYear ? 6 : 3),
        pointBackgroundColor: labels.map(label => label === selectedYear ? colors.highlight : colors.point),
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

  const chartOptions: ChartOptions<'line'> = {
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
          title: (context: unknown) => {
            const ctxArr = context as Array<Record<string, unknown>>;
            const label = ctxArr[0]?.label as string | undefined;
            return `${getSubPeriodName()} ${label ?? ''}`;
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Year' } },
      y: { title: { display: true, text: isAnomaly ? 'Anomaly Value' : 'Value' } },
    },
  };

  return <Line options={chartOptions} data={lineChartData} />;
};