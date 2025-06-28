import React from "react";
import type { SleepRecord } from "../lib/supabase";
import { processData, prepareChartData } from "../lib/sleepUtils";
import { SleepChart } from "./SleepChart";

interface SleepDashboardProps {
  onAddRecord: () => void;
  sleepRecords: SleepRecord[];
  loading: boolean;
  error: string | null;
}

export const SleepDashboard: React.FC<SleepDashboardProps> = ({ 
  onAddRecord, 
  sleepRecords, 
  loading, 
  error 
}) => {


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

  const processedData = processData(sleepRecords);
  const chartData = prepareChartData(processedData);

  return (
    <div className="sleep-dashboard">
      <header className="dashboard-header">
        <h1>Sleep Tracker Dashboard</h1>
        <p>
          Tracking {sleepRecords.length} total records, {processedData.length}{" "}
          processed entries
        </p>
        <button onClick={onAddRecord}>Add New Record</button>
      </header>

      <div className="charts-container">
        <section className="chart-section">
          <h2>Time in Bed</h2>
          <SleepChart
            data={chartData.timeInBed.data}
            rollingAverage={chartData.timeInBed.average}
            label="Time in Bed"
            color="#4fc3f7"
          />
        </section>

        <section className="chart-section">
          <h2>Time Asleep</h2>
          <SleepChart
            data={chartData.timeAsleep.data}
            rollingAverage={chartData.timeAsleep.average}
            label="Time Asleep"
            color="#81c784"
          />
        </section>

        <section className="chart-section">
          <h2>Sleep Efficiency</h2>
          <SleepChart
            data={chartData.efficiency.data}
            rollingAverage={chartData.efficiency.average}
            label="Sleep Efficiency"
            color="#ffb74d"
            isPercentage={true}
          />
        </section>

        <section className="chart-section">
          <h2>Time to Fall Asleep</h2>
          <SleepChart
            data={chartData.fallAsleep.data}
            rollingAverage={chartData.fallAsleep.average}
            label="Time to Fall Asleep"
            color="#ba68c8"
            isMinutes={true}
          />
        </section>

        <section className="chart-section">
          <h2>Time Trying to Sleep After Final Awakening</h2>
          <SleepChart
            data={chartData.tryingToSleep.data}
            rollingAverage={chartData.tryingToSleep.average}
            label="Time Trying to Sleep"
            color="#f06292"
            isMinutes={true}
          />
        </section>
      </div>
    </div>
  );
};
