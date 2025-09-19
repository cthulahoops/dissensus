import { formatHoursMinutes, getLatestAverage } from "../lib/sleepUtils";
import type { AveragedData } from "../lib/sleepUtils";

type AveragesSummaryProps = {
  averages: AveragedData;
};

export function AveragesSummary({ averages }: AveragesSummaryProps) {
  return (
    <section className="averages-summary">
      <h2>7-Day Averages (Latest)</h2>
      <div className="averages-grid">
        <AverageCard
          averages={averages}
          dataKey="totalTimeInBed"
          unit="hours"
          title="Time in Bed"
        />
        <AverageCard
          averages={averages}
          dataKey="totalTimeAsleep"
          unit="hours"
          title="Time Asleep"
        />
        <AverageCard
          averages={averages}
          dataKey="sleepEfficiency"
          unit="percent"
          title="Sleep Efficiency"
        />
        <AverageCard
          averages={averages}
          dataKey="timeToFallAsleepMinutes"
          unit="minutes"
          title="Time to Fall Asleep"
        />
        <AverageCard
          averages={averages}
          dataKey="timeTryingToSleepMinutes"
          unit="minutes"
          title="Trying to Sleep After Awakening"
        />
        <AverageCard
          averages={averages}
          dataKey="timeAwakeInNightMinutes"
          unit="minutes"
          title="Time Awake in Night"
        />
      </div>
    </section>
  );
}

type AverageCardProps = {
  averages: AveragedData;
  dataKey: keyof AveragedData;
  unit: "hours" | "percent" | "minutes";
  title: string;
};

function AverageCard({ averages, dataKey, unit, title }: AverageCardProps) {
  const value = getLatestAverage(averages, dataKey);

  return (
    <div className="average-card">
      <h3>{title}</h3>
      <div className="average-value">{formatValue(value, unit)}</div>
    </div>
  );
}

function formatValue(
  value: number | null,
  unit: "hours" | "percent" | "minutes",
) {
  if (value === null) {
    return "N/A";
  } else if (unit === "hours") {
    return formatHoursMinutes(value);
  } else if (unit === "percent") {
    return `${value.toFixed(1)}%`;
  } else if (unit === "minutes") {
    return `${Math.round(value)} min`;
  } else {
    return value.toString();
  }
}
