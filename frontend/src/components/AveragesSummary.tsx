import { formatHoursMinutes, getLatestAverage } from "../lib/sleepUtils";
import type { ProcessedSleepData } from "../lib/sleepUtils";

type AveragesSummaryProps = {
  processedData: ProcessedSleepData[];
  allProcessedData: ProcessedSleepData[];
};

export function AveragesSummary({
  processedData,
  allProcessedData,
}: AveragesSummaryProps) {
  return (
    <section className="averages-summary">
      <h2>7-Day Averages (Latest)</h2>
      <div className="averages-grid">
        <div className="average-card">
          <h3>Time in Bed</h3>
          <div className="average-value">
            {formatHoursMinutes(
              getLatestAverage(
                allProcessedData,
                processedData,
                "totalTimeInBed",
              ),
            )}
          </div>
        </div>
        <div className="average-card">
          <h3>Time Asleep</h3>
          <div className="average-value">
            {formatHoursMinutes(
              getLatestAverage(
                processedData,
                allProcessedData,
                "totalTimeAsleep",
              ),
            )}
          </div>
        </div>
        <div className="average-card">
          <h3>Sleep Efficiency</h3>
          <div className="average-value">
            {(() => {
              const efficiency = getLatestAverage(
                processedData,
                allProcessedData,
                "sleepEfficiency",
              );
              return efficiency !== null ? `${efficiency.toFixed(1)}%` : "N/A";
            })()}
          </div>
        </div>
        <div className="average-card">
          <h3>Time to Fall Asleep</h3>
          <div className="average-value">
            {(() => {
              const minutes = getLatestAverage(
                processedData,
                allProcessedData,
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
                processedData,
                allProcessedData,
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
                processedData,
                allProcessedData,
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
