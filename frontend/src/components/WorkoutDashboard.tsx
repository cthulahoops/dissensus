import { useMemo } from "react";
import type { Workout } from "../lib/supabase";
import "./WorkoutDashboard.css";

type WorkoutDashboardProps = {
  workouts: Workout[];
  loading: boolean;
  error: string | null;
  onScanQR?: () => void;
};

export function WorkoutDashboard({
  workouts,
  loading,
  error,
  onScanQR,
}: WorkoutDashboardProps) {
  const stats = useMemo(() => {
    if (!workouts.length) {
      return {
        totalWorkouts: 0,
        totalDistance: 0,
        totalCalories: 0,
        totalDuration: 0,
      };
    }

    return {
      totalWorkouts: workouts.length,
      totalDistance: workouts.reduce((sum, w) => sum + (w.distance_km || 0), 0),
      totalCalories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      totalDuration: workouts.reduce(
        (sum, w) => sum + (w.duration_seconds || 0),
        0,
      ),
    };
  }, [workouts]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading workout data...</h2>
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
        <h1>Workout Tracker</h1>
        {onScanQR && (
          <button onClick={onScanQR}>
            Scan QR Code
          </button>
        )}
        <p>Tracking {workouts.length} total workouts</p>
      </header>

      <div className="workout-dashboard">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalWorkouts}</div>
            <div className="stat-label">Total Workouts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalDistance.toFixed(2)} km</div>
            <div className="stat-label">Total Distance</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalCalories}</div>
            <div className="stat-label">Total Calories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {formatDuration(stats.totalDuration)}
            </div>
            <div className="stat-label">Total Duration</div>
          </div>
        </div>

        {workouts.length === 0 ? (
          <section className="empty-state">
            <h2>No workouts yet</h2>
            <p>Scan a Halo Fitness QR code to log your first workout!</p>
            {onScanQR && (
              <button onClick={onScanQR} className="btn-primary">
                Scan QR Code
              </button>
            )}
          </section>
        ) : (
          <section className="workouts-list">
            <h2>Recent Workouts</h2>
            <div className="workout-items">
              {workouts.map((workout) => (
                <div key={workout.id} className="workout-item">
                  <div className="workout-date">
                    {formatDate(workout.workout_date)}
                  </div>
                  <div className="workout-details">
                    <div className="workout-metric">
                      <span className="metric-label">Distance:</span>
                      <span className="metric-value">
                        {workout.distance_km?.toFixed(2) || "N/A"} km
                      </span>
                    </div>
                    <div className="workout-metric">
                      <span className="metric-label">Duration:</span>
                      <span className="metric-value">
                        {formatDuration(workout.duration_seconds || 0)}
                      </span>
                    </div>
                    <div className="workout-metric">
                      <span className="metric-label">Calories:</span>
                      <span className="metric-value">
                        {workout.calories || "N/A"}
                      </span>
                    </div>
                    {workout.avg_heart_rate && (
                      <div className="workout-metric">
                        <span className="metric-label">Avg HR:</span>
                        <span className="metric-value">
                          {workout.avg_heart_rate} bpm
                        </span>
                      </div>
                    )}
                    {workout.avg_pace && (
                      <div className="workout-metric">
                        <span className="metric-label">Avg Pace:</span>
                        <span className="metric-value">{workout.avg_pace}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
