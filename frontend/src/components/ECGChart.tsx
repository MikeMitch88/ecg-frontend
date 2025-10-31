import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
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

interface ECGChartProps {
  data?: number[];
  height?: number;
  showGrid?: boolean;
  showPoints?: boolean;
  color?: string;
}

const ECGChart: React.FC<ECGChartProps> = ({
  data,
  height = 300,
  showGrid = true,
  showPoints = false,
  color = '#3b82f6'
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Generate sample ECG data if no data provided
  const generateSampleECG = () => {
    const points = 1000;
    const time = Array.from({ length: points }, (_, i) => i / 100); // 10 seconds at 100Hz
    const signal = [];
    
    for (let i = 0; i < points; i++) {
      const t = time[i];
      // Generate ECG-like signal with R-peaks every ~0.8 seconds
      const heartRate = 75; // BPM
      const rrInterval = 60 / heartRate;
      const rPeak = Math.sin(2 * Math.PI * t / rrInterval) * Math.exp(-Math.pow((t % rrInterval - rrInterval/2) / 0.1, 2));
      const noise = (Math.random() - 0.5) * 0.1;
      signal.push(rPeak + noise);
    }
    
    return { time, signal };
  };

  // Use provided data or generate sample data
  const { time, signal } = data ? 
    { time: Array.from({ length: data.length }, (_, i) => i), signal: data } : 
    generateSampleECG();

  const chartData = {
    labels: time,
    datasets: [
      {
        label: 'ECG Signal',
        data: signal,
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        pointRadius: showPoints ? 1 : 0,
        pointHoverRadius: 3,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            return `Amplitude: ${context.parsed.y.toFixed(3)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time (s)',
          color: '#6b7280',
        },
        grid: {
          display: showGrid,
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amplitude (mV)',
          color: '#6b7280',
        },
        grid: {
          display: showGrid,
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      point: {
        radius: showPoints ? 1 : 0,
        hoverRadius: 3,
      },
    },
  };

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default ECGChart;


