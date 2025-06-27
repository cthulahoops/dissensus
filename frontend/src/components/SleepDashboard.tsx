import React, { useState, useEffect } from "react";
import { sleepRecordsAPI } from "../lib/supabase";
import type { SleepRecord } from "../lib/supabase";
import { processData, prepareChartData } from "../lib/sleepUtils";
import { SleepChart } from "./SleepChart";

// Test user ID from the import (you can replace this with actual auth later)
const TEST_USER_ID = import.meta.env.VITE_TEST_USER_ID;

export const SleepDashboard: React.FC = () => {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // First, try to sign in as the test user
        // (In production, you'd use real authentication)
        const { error: signInError } = await sleepRecordsAPI.signInTestUser();
        if (signInError) {
          console.warn("Sign in failed, trying without auth:", signInError);
        }

        const records = await sleepRecordsAPI.getAll(TEST_USER_ID);
        setSleepRecords(records);
        setError(null);
      } catch (err) {
        console.error("Error fetching sleep records:", err);
        setError("Failed to load sleep data: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <h2>Time Awake in Bed</h2>
          <SleepChart
            data={chartData.awakeInBed.data}
            rollingAverage={chartData.awakeInBed.average}
            label="Time Awake in Bed"
            color="#f06292"
            isMinutes={true}
          />
        </section>
      </div>
    </div>
  );
};
