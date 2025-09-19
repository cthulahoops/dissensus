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
        <div className="average-card">
          <h3>Time in Bed</h3>
          <div className="average-value">
            {formatHoursMinutes(getLatestAverage(averages, "totalTimeInBed"))}
          </div>
        </div>
        <div className="average-card">
          <h3>Time Asleep</h3>
          <div className="average-value">
            {formatHoursMinutes(getLatestAverage(averages, "totalTimeAsleep"))}
          </div>
        </div>
        <div className="average-card">
          <h3>Sleep Efficiency</h3>
          <div className="average-value">
            {(() => {
              const efficiency = getLatestAverage(averages, "sleepEfficiency");
              return efficiency !== null ? `${efficiency.toFixed(1)}%` : "N/A";
            })()}
          </div>
        </div>
        <div className="average-card">
          <h3>Time to Fall Asleep</h3>
          <div className="average-value">
            {(() => {
              const minutes = getLatestAverage(
                averages,
                "timeToFallAsleepMinutes",
              );
              return minutes !== null ? `${Math.round(minutes)} min` : "N/A";
            })()}
          </div>
        </div>
        <div className="average-card">
          <h3>Trying to Sleep After Awakening</h3>
          <div className="average-value">
            {(() => {
              const minutes = getLatestAverage(
                averages,
                "timeTryingToSleepMinutes",
              );
              return minutes !== null ? `${Math.round(minutes)} min` : "N/A";
            })()}
          </div>
        </div>
        <div className="average-card">
          <h3>Time Awake in Night</h3>
          <div className="average-value">
            {(() => {
              const minutes = getLatestAverage(
                averages,
                "timeAwakeInNightMinutes",
              );
              return minutes !== null ? `${Math.round(minutes)} min` : "N/A";
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
