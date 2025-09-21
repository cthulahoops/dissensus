import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import type {
  ProcessedSleepData,
  DataKey,
  AveragedData,
} from "../lib/sleepUtils";
import { formatHoursMinutes, ROLLING_AVERAGE_DAYS } from "../lib/sleepUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

type SleepChartProps = {
  selectedData: ProcessedSleepData[];
  averages: AveragedData;
  dataKey: DataKey;
  label: string;
  color: string;
  dataUnits?: DataUnits;
};

type DataUnits = "hours" | "percentage" | "minutes";

export function SleepChart({
  averages,
  selectedData,
  dataKey,
  label,
  color,
  dataUnits = "hours",
}: SleepChartProps) {
  const data = selectedData.map((d) => ({
    date: d.date,
    value: d[dataKey],
  }));
  const rollingAverage = averages[dataKey].slice(-data.length);

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
        pointRadius: 3,
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
            const valueLabel = formatValue(value, dataUnits, 1);
            return `${label}: ${valueLabel}`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: dataUnits === "percentage" ? 100 : undefined,
        grid: {
          color: "#e0e0e0",
        },
        ticks: {
          callback: (value: number | string) => formatValue(value, dataUnits),
          precision: 0,
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
    <section>
      <h2>{label}</h2>
      <div className="chart-container">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </section>
  );
}

function formatValue(
  value: string | number,
  dataUnits: DataUnits,
  precision = 0,
) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (dataUnits === "percentage") {
    return numValue.toFixed(precision) + "%";
  } else if (dataUnits === "minutes") {
    return numValue.toFixed(precision) + " min";
  } else {
    return formatHoursMinutes(numValue);
  }
}
