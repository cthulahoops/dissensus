import { useState, useMemo } from "react";
import type { SleepRecord } from "../lib/supabase";
import {
  processData,
  prepareChartData,
  filterRecordsByDateRange,
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

  // Filter records based on selected time range
  const filteredRecords = useMemo(() => {
    return filterRecordsByDateRange(sleepRecords, selectedTimeRange);
  }, [sleepRecords, selectedTimeRange]);

  // Process all data for rolling averages and filtered data for display
  const allProcessedData = useMemo(() => {
    return processData(sleepRecords);
  }, [sleepRecords]);

  const processedData = useMemo(() => {
    return processData(filteredRecords);
  }, [filteredRecords]);

  const chartData = useMemo(() => {
    return prepareChartData(processedData, allProcessedData);
  }, [processedData, allProcessedData]);

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
        selectedData={filteredRecords}
      />

      <AveragesSummary chartData={chartData} />

      <SleepChart
        data={chartData.timeInBed.data}
        rollingAverage={chartData.timeInBed.average}
        label="Time in Bed"
        color="#4fc3f7"
      />

      <SleepChart
        data={chartData.timeAsleep.data}
        rollingAverage={chartData.timeAsleep.average}
        label="Time Asleep"
        color="#81c784"
      />

      <SleepChart
        data={chartData.efficiency.data}
        rollingAverage={chartData.efficiency.average}
        label="Sleep Efficiency"
        color="#ffb74d"
        isPercentage={true}
      />

      <SleepChart
        data={chartData.fallAsleep.data}
        rollingAverage={chartData.fallAsleep.average}
        label="Time to Fall Asleep"
        color="#ba68c8"
        isMinutes={true}
      />

      <SleepChart
        data={chartData.tryingToSleep.data}
        rollingAverage={chartData.tryingToSleep.average}
        label="Time Trying to Sleep After Final Awakening"
        color="#f06292"
        isMinutes={true}
      />

      <SleepChart
        data={chartData.timeAwakeInNight.data}
        rollingAverage={chartData.timeAwakeInNight.average}
        label="Time Awake in Night"
        color="#ff8a65"
        isMinutes={true}
      />
    </main>
  );
}
