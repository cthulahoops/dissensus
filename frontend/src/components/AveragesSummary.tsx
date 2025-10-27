import { getLatestAverage } from "../lib/sleepUtils";
import type { AveragedData } from "../lib/sleepUtils";
import { BalancedGrid } from "./ui/BalancedGrid";
import { StatCard } from "./ui/StatCard";

type AveragesSummaryProps = {
  averages: AveragedData;
};

export function AveragesSummary({ averages }: AveragesSummaryProps) {
  return (
    <BalancedGrid>
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
    </BalancedGrid>
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

  return <StatCard value={{ value, unit }} label={title} />;
}
