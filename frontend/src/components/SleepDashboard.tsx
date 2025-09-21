import { useState, useMemo } from "react";
import type { SleepRecord } from "../lib/supabase";
import {
  processData,
  filterRecordsByDateRange,
  getAveragedData,
} from "../lib/sleepUtils";
import { SleepChart } from "./SleepChart";
import { type TimeRange } from "./TimeRangeSelector";
import { DashboardHeader } from "./DashboardHeader";
import { AveragesSummary } from "./AveragesSummary";

type SleepDashboardProps = {
  onAddRecord: () => void;
  sleepRecords: SleepRecord[];
  loading: boolean;
  error: string | null;
  isSharedView?: boolean;
  sharedViewInfo?: string;
};

export function SleepDashboard({
  onAddRecord,
  sleepRecords,
  loading,
  error,
  isSharedView = false,
  sharedViewInfo,
}: SleepDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("14d");

  const allProcessedData = useMemo(
    () => processData(sleepRecords),
    [sleepRecords],
  );

  const averages = useMemo(
    () => getAveragedData(allProcessedData),
    [allProcessedData],
  );

  const selectedData = useMemo(() => {
    return filterRecordsByDateRange(allProcessedData, selectedTimeRange);
  }, [allProcessedData, selectedTimeRange]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading sleep data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <main>
      <DashboardHeader
        selectedTimeRange={selectedTimeRange}
        setSelectedTimeRange={setSelectedTimeRange}
        onAddRecord={onAddRecord}
        sleepRecords={sleepRecords}
        isSharedView={isSharedView}
        sharedViewInfo={sharedViewInfo}
        selectedData={selectedData}
      />

      <AveragesSummary averages={averages} />

      <SleepChart
        selectedData={selectedData}
        averages={averages}
        dataKey="totalTimeInBed"
        label="Time in Bed"
        color="#4fc3f7"
      />

      <SleepChart
        selectedData={selectedData}
        averages={averages}
        dataKey="totalTimeAsleep"
        label="Time Asleep"
        color="#81c784"
      />

      <SleepChart
        selectedData={selectedData}
        averages={averages}
        dataKey="sleepEfficiency"
        label="Sleep Efficiency"
        color="#ffb74d"
        dataUnits="percentage"
      />

      <SleepChart
        selectedData={selectedData}
        averages={averages}
        dataKey="timeToFallAsleepMinutes"
        label="Time to Fall Asleep"
        color="#ba68c8"
        dataUnits="minutes"
      />

      <SleepChart
        selectedData={selectedData}
        averages={averages}
        dataKey="timeTryingToSleepMinutes"
        label="Time Trying to Sleep After Final Awakening"
        color="#f06292"
        dataUnits="minutes"
      />

      <SleepChart
        selectedData={selectedData}
        averages={averages}
        dataKey="timeAwakeInNightMinutes"
        label="Time Awake in Night"
        color="#ff8a65"
        dataUnits="minutes"
      />

      <SleepChart
        selectedData={selectedData}
        averages={averages}
        dataKey="woreBiteGuard"
        label="Bite Guard Usage"
        color="#9c27b0"
        dataUnits="percentage"
      />
    </main>
  );
}
