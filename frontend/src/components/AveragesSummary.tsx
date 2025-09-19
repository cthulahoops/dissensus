import { prepareChartData, formatHoursMinutes } from "../lib/sleepUtils";

export function AveragesSummary({
  chartData,
}: {
  chartData: ReturnType<typeof prepareChartData>;
}) {
  return (
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
        <div className="average-card">
          <h3>Time Awake in Night</h3>
          <div className="average-value">
            {(() => {
              const minutes = getLatestAverage(
                chartData.timeAwakeInNight.average,
              );
              return minutes !== null ? `${Math.round(minutes)} min` : "N/A";
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}

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
