import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import type { ChartDataPoint } from "../lib/sleepUtils";
import { formatHoursMinutes, ROLLING_AVERAGE_DAYS } from "../lib/sleepUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

interface SleepChartProps {
  data: ChartDataPoint[];
  rollingAverage: (number | null)[];
  label: string;
  color: string;
  isPercentage?: boolean;
  isMinutes?: boolean;
}

export const SleepChart: React.FC<SleepChartProps> = ({
  data,
  rollingAverage,
  label,
  color,
  isPercentage = false,
  isMinutes = false,
}) => {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: label,
        data: data.map((d) => d.value),
        backgroundColor: color + "80",
        borderColor: color,
        borderWidth: 1,
        type: "bar" as const,
        order: 2,
      },
      {
        label: `${ROLLING_AVERAGE_DAYS}-Day Rolling Average`,
        data: rollingAverage,
        type: "line" as const,
        borderColor: "#ff6b6b",
        backgroundColor: "transparent",
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#ff6b6b",
        tension: 0.4,
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: {
            parsed: { y: number };
            dataset: { label?: string };
          }) {
            const value = context.parsed.y;
            const label = context.dataset.label || "Data";
            if (isPercentage) {
              return `${label}: ${value.toFixed(1)}%`;
            } else if (isMinutes) {
              return `${label}: ${value} minutes`;
            } else {
              return `${label}: ${formatHoursMinutes(value)}`;
            }
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#e0e0e0",
        },
        ticks: {
          callback: function (value: string | number) {
            const numValue =
              typeof value === "string" ? parseFloat(value) : value;
            if (isPercentage) {
              return numValue + "%";
            } else if (isMinutes) {
              return numValue + " min";
            } else {
              return formatHoursMinutes(numValue);
            }
          },
        },
      },
      x: {
        grid: {
          color: "#e0e0e0",
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      },
    },
  };

  return (
    <div className="chart-container" style={{ width: "100%" }}>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
};
