import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createManualWorkout } from "../lib/workoutUtils";
import type { WorkoutInsert } from "../lib/supabase";

type ManualWorkoutFormProps = {
  user: User;
  onSubmit: (workout: WorkoutInsert) => void;
  onValidationError?: (message: string) => void;
};

export const ManualWorkoutForm = ({
  user,
  onSubmit,
  onValidationError,
}: ManualWorkoutFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Get today's date in YYYY-MM-DD format for the default
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    date: today,
    time: "", // Optional time in HH:MM format
    workoutType: "run", // Default workout type
    durationMinutes: "",
    calories: "",
    distanceKm: "",
    avgSpeedKmh: "",
    avgPace: "",
    avgHeartRate: "",
    maxHeartRate: "",
    avgWatts: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least date and one metric is provided
    if (!formData.date) {
      onValidationError?.("Please provide a workout date");
      return;
    }

    const hasAtLeastOneMetric =
      formData.durationMinutes ||
      formData.calories ||
      formData.distanceKm ||
      formData.avgSpeedKmh ||
      formData.avgPace ||
      formData.avgHeartRate ||
      formData.maxHeartRate ||
      formData.avgWatts;

    if (!hasAtLeastOneMetric) {
      onValidationError?.("Please provide at least one workout metric");
      return;
    }

    setIsProcessing(true);
    try {
      // Create workout date-time string
      // If time is provided, use it; otherwise use current time
      let workoutDate: string;
      if (formData.time) {
        // Combine date and time in local timezone, then convert to ISO
        workoutDate = new Date(formData.date + "T" + formData.time).toISOString();
      } else {
        // Use current time
        const now = new Date();
        const dateParts = formData.date.split("-");
        now.setFullYear(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        workoutDate = now.toISOString();
      }

      const workout = createManualWorkout(
        {
          date: workoutDate,
          workoutType: formData.workoutType,
          durationMinutes: formData.durationMinutes
            ? parseFloat(formData.durationMinutes)
            : undefined,
          calories: formData.calories
            ? parseInt(formData.calories, 10)
            : undefined,
          distanceKm: formData.distanceKm
            ? parseFloat(formData.distanceKm)
            : undefined,
          avgSpeedKmh: formData.avgSpeedKmh
            ? parseFloat(formData.avgSpeedKmh)
            : undefined,
          avgPace: formData.avgPace || undefined,
          avgHeartRate: formData.avgHeartRate
            ? parseInt(formData.avgHeartRate, 10)
            : undefined,
          maxHeartRate: formData.maxHeartRate
            ? parseInt(formData.maxHeartRate, 10)
            : undefined,
          avgWatts: formData.avgWatts
            ? parseInt(formData.avgWatts, 10)
            : undefined,
        },
        user.id
      );

      await onSubmit(workout);

      // Reset form on success
      setFormData({
        date: today,
        time: "",
        workoutType: "run",
        durationMinutes: "",
        calories: "",
        distanceKm: "",
        avgSpeedKmh: "",
        avgPace: "",
        avgHeartRate: "",
        maxHeartRate: "",
        avgWatts: "",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="manual-workout-form">
      <form onSubmit={handleSubmit}>
        <label htmlFor="date" className="required">Workout Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={today}
          required
          disabled={isProcessing}
        />

        <label htmlFor="time">Workout Time</label>
        <input
          type="time"
          id="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          disabled={isProcessing}
        />
        <small className="help-text">Optional - defaults to current time if not specified</small>

        <label htmlFor="workoutType">Workout Type</label>
        <select
          id="workoutType"
          name="workoutType"
          value={formData.workoutType}
          onChange={handleChange}
          disabled={isProcessing}
        >
          <option value="run">Run</option>
          <option value="swim">Swim</option>
          <option value="bike">Bike</option>
          <option value="walk">Walk</option>
          <option value="hike">Hike</option>
          <option value="strength">Strength Training</option>
          <option value="yoga">Yoga</option>
          <option value="other">Other</option>
        </select>

        <fieldset className="form-section">
          <legend>Workout Metrics</legend>
          <p className="section-note">Fill in any metrics you have available</p>

          <label htmlFor="durationMinutes">Duration (minutes)</label>
          <input
            type="number"
            id="durationMinutes"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={handleChange}
            min="0"
            step="0.1"
            placeholder="e.g., 45"
            disabled={isProcessing}
          />

          <label htmlFor="calories">Calories</label>
          <input
            type="number"
            id="calories"
            name="calories"
            value={formData.calories}
            onChange={handleChange}
            min="0"
            placeholder="e.g., 350"
            disabled={isProcessing}
          />

          <label htmlFor="distanceKm">Distance (km)</label>
          <input
            type="number"
            id="distanceKm"
            name="distanceKm"
            value={formData.distanceKm}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="e.g., 5.5"
            disabled={isProcessing}
          />

          <label htmlFor="avgSpeedKmh">Avg Speed (km/h)</label>
          <input
            type="number"
            id="avgSpeedKmh"
            name="avgSpeedKmh"
            value={formData.avgSpeedKmh}
            onChange={handleChange}
            min="0"
            step="0.1"
            placeholder="e.g., 12.5"
            disabled={isProcessing}
          />

          <label htmlFor="avgPace">Average Pace</label>
          <input
            type="text"
            id="avgPace"
            name="avgPace"
            value={formData.avgPace}
            onChange={handleChange}
            placeholder="e.g., 5:30/km"
            disabled={isProcessing}
          />
          <small className="help-text">Format: MM:SS/km</small>

          <label htmlFor="avgHeartRate">Avg Heart Rate (bpm)</label>
          <input
            type="number"
            id="avgHeartRate"
            name="avgHeartRate"
            value={formData.avgHeartRate}
            onChange={handleChange}
            min="0"
            max="250"
            placeholder="e.g., 145"
            disabled={isProcessing}
          />

          <label htmlFor="maxHeartRate">Max Heart Rate (bpm)</label>
          <input
            type="number"
            id="maxHeartRate"
            name="maxHeartRate"
            value={formData.maxHeartRate}
            onChange={handleChange}
            min="0"
            max="250"
            placeholder="e.g., 180"
            disabled={isProcessing}
          />

          <label htmlFor="avgWatts">Average Power (watts)</label>
          <input
            type="number"
            id="avgWatts"
            name="avgWatts"
            value={formData.avgWatts}
            onChange={handleChange}
            min="0"
            placeholder="e.g., 200"
            disabled={isProcessing}
          />
        </fieldset>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? "Adding..." : "Add Workout"}
          </button>
        </div>
      </form>
    </div>
  );
};
