import React, { useState, useMemo } from "react";
import type { SleepRecord } from "../lib/supabase";
import { processData, prepareChartData, formatHoursMinutes, filterRecordsByDateRange } from "../lib/sleepUtils";
import { SleepChart } from "./SleepChart";
import { TimeRangeSelector, type TimeRange } from "./TimeRangeSelector";

interface SleepDashboardProps {
  onAddRecord: () => void;
  sleepRecords: SleepRecord[];
  loading: boolean;
  error: string | null;
  isSharedView?: boolean;
  sharedViewInfo?: string;
}

// Helper function to get the latest rolling average value
function getLatestAverage(averageArray: (number | null)[]): number | null {
  if (averageArray.length === 0) return null;
  // Find the last non-null value
  for (let i = averageArray.length - 1; i >= 0; i--) {
    if (averageArray[i] !== null) {
      return averageArray[i];
    }
  }
  return null;
}

export const SleepDashboard: React.FC<SleepDashboardProps> = ({ 
  onAddRecord, 
  sleepRecords, 
  loading, 
  error,
  isSharedView = false,
  sharedViewInfo
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("all");

  // Filter records based on selected time range
  const filteredRecords = useMemo(() => {
    return filterRecordsByDateRange(sleepRecords, selectedTimeRange);
  }, [sleepRecords, selectedTimeRange]);

  // Process filtered data
  const processedData = useMemo(() => {
    return processData(filteredRecords);
  }, [filteredRecords]);

  const chartData = useMemo(() => {
    return prepareChartData(processedData);
  }, [processedData]);

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
      <header className="dashboard-header">
        <h1>{isSharedView ? 'Shared Sleep Dashboard' : 'Sleep Tracker Dashboard'}</h1>
        {isSharedView && sharedViewInfo && (
          <p style={{ marginBottom: 'var(--spacing-md)', opacity: 0.9 }}>
            {sharedViewInfo}
          </p>
        )}
        <div className="dashboard-controls">
          <TimeRangeSelector
            selectedRange={selectedTimeRange}
            onRangeChange={setSelectedTimeRange}
          />
          {!isSharedView && (
            <button onClick={onAddRecord}>Add New Record</button>
          )}
        </div>
        <p>
          {isSharedView ? 'Viewing' : 'Tracking'} {sleepRecords.length} total records, showing {processedData.length}{" "}
          filtered entries
        </p>
      </header>

      {/* 7-Day Averages Summary */}
      <section className="averages-summary">
        <h2>7-Day Averages (Latest)</h2>
        <div className="averages-grid">
          <div className="average-card">
            <h3>Time in Bed</h3>
            <div className="average-value">
              {formatHoursMinutes(getLatestAverage(chartData.timeInBed.average))}
            </div>
          </div>
          <div className="average-card">
            <h3>Time Asleep</h3>
            <div className="average-value">
              {formatHoursMinutes(getLatestAverage(chartData.timeAsleep.average))}
            </div>
          </div>
          <div className="average-card">
            <h3>Sleep Efficiency</h3>
            <div className="average-value">
              {(() => {
                const efficiency = getLatestAverage(chartData.efficiency.average);
                return efficiency !== null ? `${efficiency.toFixed(1)}%` : "N/A";
              })()}
            </div>
          </div>
          <div className="average-card">
            <h3>Time to Fall Asleep</h3>
            <div className="average-value">
              {(() => {
                const minutes = getLatestAverage(chartData.fallAsleep.average);
                return minutes !== null ? `${Math.round(minutes)} min` : "N/A";
              })()}
            </div>
          </div>
          <div className="average-card">
            <h3>Trying to Sleep After Awakening</h3>
            <div className="average-value">
              {(() => {
                const minutes = getLatestAverage(chartData.tryingToSleep.average);
                return minutes !== null ? `${Math.round(minutes)} min` : "N/A";
              })()}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>Time in Bed</h2>
        <SleepChart
          data={chartData.timeInBed.data}
          rollingAverage={chartData.timeInBed.average}
          label="Time in Bed"
          color="#4fc3f7"
        />
      </section>

      <section>
        <h2>Time Asleep</h2>
        <SleepChart
          data={chartData.timeAsleep.data}
          rollingAverage={chartData.timeAsleep.average}
          label="Time Asleep"
          color="#81c784"
        />
      </section>

      <section>
        <h2>Sleep Efficiency</h2>
        <SleepChart
          data={chartData.efficiency.data}
          rollingAverage={chartData.efficiency.average}
          label="Sleep Efficiency"
          color="#ffb74d"
          isPercentage={true}
        />
      </section>

      <section>
        <h2>Time to Fall Asleep</h2>
        <SleepChart
          data={chartData.fallAsleep.data}
          rollingAverage={chartData.fallAsleep.average}
          label="Time to Fall Asleep"
          color="#ba68c8"
          isMinutes={true}
        />
      </section>

      <section>
        <h2>Time Trying to Sleep After Final Awakening</h2>
        <SleepChart
          data={chartData.tryingToSleep.data}
          rollingAverage={chartData.tryingToSleep.average}
          label="Time Trying to Sleep"
          color="#f06292"
          isMinutes={true}
        />
      </section>
    </main>
  );
};
