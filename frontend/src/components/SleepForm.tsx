import React, { useState } from "react";
import type { SleepRecord, SleepRecordInsert } from "../lib/supabase";

type SleepFormProps = {
  onSubmit: (record: SleepRecordInsert) => void;
  onCancel: () => void;
  userId: string;
  existingRecord?: SleepRecord;
};

export function SleepForm({
  onSubmit,
  onCancel,
  userId,
  existingRecord,
}: SleepFormProps) {
  const [formData, setFormData] = useState({
    date: existingRecord?.date || new Date().toISOString().split("T")[0],
    comments: existingRecord?.comments || "",
    time_got_into_bed: existingRecord?.time_got_into_bed || "",
    time_tried_to_sleep: existingRecord?.time_tried_to_sleep || "",
    time_to_fall_asleep_mins:
      existingRecord?.time_to_fall_asleep_mins?.toString() || "",
    times_woke_up_count: existingRecord?.times_woke_up_count?.toString() || "",
    total_awake_time_mins:
      existingRecord?.total_awake_time_mins?.toString() || "",
    final_awakening_time: existingRecord?.final_awakening_time || "",
    time_trying_to_sleep_after_final_awakening_mins:
      existingRecord?.time_trying_to_sleep_after_final_awakening_mins?.toString() ||
      "",
    time_got_out_of_bed: existingRecord?.time_got_out_of_bed || "",
    sleep_quality_rating: existingRecord?.sleep_quality_rating || "",
    wore_bite_guard: existingRecord?.wore_bite_guard?.toString() || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert date to Unix timestamp
      const dateUnix = new Date(formData.date).getTime() / 1000;

      // Build the record object, only including non-empty values
      const record: SleepRecordInsert = {
        user_id: userId,
        date: formData.date,
        date_unix: dateUnix,
      };

      // Add optional string fields if they have values
      if (formData.comments.trim()) record.comments = formData.comments.trim();
      if (formData.time_got_into_bed)
        record.time_got_into_bed = formData.time_got_into_bed;
      if (formData.time_tried_to_sleep)
        record.time_tried_to_sleep = formData.time_tried_to_sleep;
      if (formData.final_awakening_time)
        record.final_awakening_time = formData.final_awakening_time;
      if (formData.time_got_out_of_bed)
        record.time_got_out_of_bed = formData.time_got_out_of_bed;
      if (formData.sleep_quality_rating)
        record.sleep_quality_rating = formData.sleep_quality_rating;

      // Add optional numeric fields if they have values
      if (formData.time_to_fall_asleep_mins) {
        record.time_to_fall_asleep_mins = parseInt(
          formData.time_to_fall_asleep_mins,
        );
      }
      if (formData.times_woke_up_count) {
        record.times_woke_up_count = parseInt(formData.times_woke_up_count);
      }
      if (formData.total_awake_time_mins) {
        record.total_awake_time_mins = parseInt(formData.total_awake_time_mins);
      }
      if (formData.time_trying_to_sleep_after_final_awakening_mins) {
        record.time_trying_to_sleep_after_final_awakening_mins = parseInt(
          formData.time_trying_to_sleep_after_final_awakening_mins,
        );
      }

      if (formData.wore_bite_guard !== "") {
        record.wore_bite_guard = formData.wore_bite_guard === "true";
      }

      // Pass the record to parent component for handling
      await onSubmit(record);
    } catch (err) {
      setError("Failed to save sleep record: " + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <header className="dashboard-header">
        <h1>{existingRecord ? "Edit Sleep Record" : "Add New Sleep Record"}</h1>
        <p>
          {existingRecord
            ? "Update your sleep data"
            : "Enter your sleep data for tracking and analysis"}
        </p>
        <button type="button" onClick={onCancel} className="btn-cancel">
          Back to Dashboard
        </button>
      </header>

      <section className="card">
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="sleep-form">
          {/* Date - Required */}
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Sleep Timing Fields */}
          <fieldset>
            <legend>Sleep Timing</legend>

            <div className="form-group">
              <label htmlFor="time_got_into_bed">Time Got Into Bed</label>
              <input
                type="time"
                id="time_got_into_bed"
                name="time_got_into_bed"
                value={formData.time_got_into_bed}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="time_tried_to_sleep">Time Tried to Sleep</label>
              <input
                type="time"
                id="time_tried_to_sleep"
                name="time_tried_to_sleep"
                value={formData.time_tried_to_sleep}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="time_to_fall_asleep_mins">
                  Time to Fall Asleep (minutes)
                </label>
                <input
                  type="number"
                  id="time_to_fall_asleep_mins"
                  name="time_to_fall_asleep_mins"
                  value={formData.time_to_fall_asleep_mins}
                  onChange={handleInputChange}
                  min="0"
                  max="999"
                />
              </div>

              <div className="form-group">
                <label htmlFor="times_woke_up_count">Times Woke Up</label>
                <input
                  type="number"
                  id="times_woke_up_count"
                  name="times_woke_up_count"
                  value={formData.times_woke_up_count}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="total_awake_time_mins">
                Total Awake Time (minutes)
              </label>
              <input
                type="number"
                id="total_awake_time_mins"
                name="total_awake_time_mins"
                value={formData.total_awake_time_mins}
                onChange={handleInputChange}
                min="0"
                max="720"
              />
            </div>

            <div className="form-group">
              <label htmlFor="final_awakening_time">Final Awakening Time</label>
              <input
                type="time"
                id="final_awakening_time"
                name="final_awakening_time"
                value={formData.final_awakening_time}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="time_trying_to_sleep_after_final_awakening_mins">
                After your final awakening, how long did you spend trying to
                sleep? (minutes)
              </label>
              <input
                type="number"
                id="time_trying_to_sleep_after_final_awakening_mins"
                name="time_trying_to_sleep_after_final_awakening_mins"
                value={formData.time_trying_to_sleep_after_final_awakening_mins}
                onChange={handleInputChange}
                min="0"
                max="300"
              />
            </div>

            <div className="form-group">
              <label htmlFor="time_got_out_of_bed">Time Got Out of Bed</label>
              <input
                type="time"
                id="time_got_out_of_bed"
                name="time_got_out_of_bed"
                value={formData.time_got_out_of_bed}
                onChange={handleInputChange}
              />
            </div>
          </fieldset>

          {/* Sleep Quality */}
          <fieldset>
            <legend>Sleep Quality</legend>

            <div className="form-group">
              <label htmlFor="sleep_quality_rating">Sleep Quality Rating</label>
              <select
                id="sleep_quality_rating"
                name="sleep_quality_rating"
                value={formData.sleep_quality_rating}
                onChange={handleInputChange}
              >
                <option value="">Select quality...</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Very Poor">Very Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="wore_bite_guard">Wore Bite Guard</label>
              <select
                id="wore_bite_guard"
                name="wore_bite_guard"
                value={formData.wore_bite_guard}
                onChange={handleInputChange}
              >
                <option value="">Select...</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </fieldset>

          {/* Comments */}
          <fieldset>
            <legend>Additional Notes</legend>

            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes about your sleep..."
              />
            </div>
          </fieldset>

          {/* Form Actions */}
          <div className="buttons">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : existingRecord
                  ? "Update Sleep Record"
                  : "Save Sleep Record"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
