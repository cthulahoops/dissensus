import { useMemo } from "react";
import type { SleepRecord } from "../lib/supabase";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { type TimeRange } from "../lib/sleepUtils";

type DashboardHeaderProps = {
  selectedTimeRange: TimeRange;
  setSelectedTimeRange: (range: TimeRange) => void;
  onAddRecord?: () => void;
  sleepRecords: SleepRecord[];
  isSharedView?: boolean;
  sharedViewInfo?: string;
  selectedData: unknown[];
};

export function DashboardHeader({
  selectedTimeRange,
  setSelectedTimeRange,
  onAddRecord,
  sleepRecords,
  isSharedView,
  sharedViewInfo,
  selectedData,
}: DashboardHeaderProps) {
  // Check if today's record exists
  const todaysRecord = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return sleepRecords.find((record) => record.date === today);
  }, [sleepRecords]);
  return (
    <header className="dashboard-header">
      <h1>
        {isSharedView ? "Shared Sleep Dashboard" : "Sleep Tracker Dashboard"}
      </h1>
      {isSharedView && sharedViewInfo && (
        <p style={{ marginBottom: "var(--spacing-md)", opacity: 0.9 }}>
          {sharedViewInfo}
        </p>
      )}
      <div className="dashboard-controls">
        <TimeRangeSelector
          selectedRange={selectedTimeRange}
          onRangeChange={setSelectedTimeRange}
        />
        {onAddRecord && (
          <button onClick={onAddRecord}>
            {todaysRecord ? "Edit Record" : "Add New Record"}
          </button>
        )}
      </div>
      <div>
        {isSharedView ? "Viewing" : "Tracking"} {sleepRecords.length} total
        records, showing {selectedData.length} filtered entries
      </div>
    </header>
  );
}
