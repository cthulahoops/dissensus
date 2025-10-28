import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { QRScanner } from "../components/QRScanner";
import { WorkoutURLPaste } from "../components/WorkoutURLPaste";
import { ManualWorkoutForm } from "../components/ManualWorkoutForm";
import { useAddWorkout } from "../hooks/useAddWorkout";
import { parseHaloQRCodeURL } from "../lib/workoutUtils";
import type { WorkoutInsert } from "../lib/supabase";
import "./AddWorkoutPage.css";

type AddWorkoutPageProps = {
  user: User;
  onBack: () => void;
};

type TabType = "scan" | "paste" | "manual";

export const AddWorkoutPage = ({ user, onBack }: AddWorkoutPageProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("scan");
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  const addWorkout = useAddWorkout(user);

  const handleWorkoutSubmit = async (workout: WorkoutInsert) => {
    // Check for duplicate
    if (lastScannedId === workout.workout_id) {
      setStatus({
        type: "error",
        message: "This workout has already been logged.",
      });
      return;
    }

    try {
      await addWorkout.mutateAsync(workout);
      setLastScannedId(workout.workout_id);
      setStatus({
        type: "success",
        message: "Workout logged successfully!",
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus({ type: "idle" });
      }, 5000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to save workout";

      // Check for duplicate error
      if (errorMsg.includes("duplicate") || errorMsg.includes("unique")) {
        setStatus({
          type: "error",
          message: "This workout has already been logged.",
        });
      } else {
        setStatus({
          type: "error",
          message: `Error saving workout: ${errorMsg}`,
        });
      }
    }
  };

  const handleQRScan = async (decodedText: string) => {
    const workout = parseHaloQRCodeURL(decodedText, user.id);

    if (!workout) {
      setStatus({
        type: "error",
        message: "Invalid QR code format. Please scan a Halo Fitness QR code.",
      });
      return;
    }

    await handleWorkoutSubmit(workout);
  };

  const handleURLPaste = async (url: string) => {
    const workout = parseHaloQRCodeURL(url, user.id);

    if (!workout) {
      setStatus({
        type: "error",
        message: "Invalid URL format. Please paste a valid Halo Fitness QR code URL.",
      });
      return;
    }

    await handleWorkoutSubmit(workout);
  };

  const handleManualSubmit = async (workout: WorkoutInsert) => {
    await handleWorkoutSubmit(workout);
  };

  return (
    <main>
      <div className="add-workout-page">
        <div className="page-header">
          <h1>Add Workout</h1>
          <button onClick={onBack} className="btn-cancel">
            Back to Dashboard
          </button>
        </div>

        {status.type === "success" && (
          <div className="status-message success">
            <strong>Success!</strong> {status.message}
          </div>
        )}

        {status.type === "error" && (
          <div className="status-message error">
            <strong>Error:</strong> {status.message}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === "scan" ? "active" : ""}`}
            onClick={() => setActiveTab("scan")}
          >
            Scan QR Code
          </button>
          <button
            className={`tab ${activeTab === "paste" ? "active" : ""}`}
            onClick={() => setActiveTab("paste")}
          >
            Paste URL
          </button>
          <button
            className={`tab ${activeTab === "manual" ? "active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            Manual Entry
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "scan" && (
            <div className="tab-panel">
              <p className="instructions">
                Point your camera at a Halo Fitness workout summary QR code to
                automatically log your workout.
              </p>
              <QRScanner onScan={handleQRScan} />
            </div>
          )}

          {activeTab === "paste" && (
            <div className="tab-panel">
              <p className="instructions">
                Copy the URL from a Halo Fitness QR code and paste it below.
              </p>
              <WorkoutURLPaste onSubmit={handleURLPaste} />
            </div>
          )}

          {activeTab === "manual" && (
            <div className="tab-panel">
              <p className="instructions">
                Manually enter your workout details.
              </p>
              <ManualWorkoutForm user={user} onSubmit={handleManualSubmit} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
