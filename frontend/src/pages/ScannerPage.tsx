import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { QRScanner } from "../components/QRScanner";
import { useAddWorkout } from "../hooks/useAddWorkout";
import type { WorkoutInsert } from "../lib/supabase";
import type { Json } from "../database.types";
import "./ScannerPage.css";

type ScannerPageProps = {
  user: User;
  onBack: () => void;
};

interface HaloWorkoutData {
  id: string;
  dt: string; // Date-time
  et?: string; // Exercise time (seconds as string)
  c?: string; // Calories
  d?: { u: string; v: string }; // Distance
  as?: { u: string; v: string }; // Avg speed
  ap?: { u: string; v: string }; // Avg pace
  ahr?: string; // Avg heart rate
  am?: string; // Min heart rate
  aw?: string; // Max heart rate (avg watts in some cases)
}

// Decode URL-safe Base64 (handles '-', '_', and missing padding)
const decodeUrlSafeBase64 = (str: string): string => {
  // Replace URL-safe characters with standard Base64 characters
  let normalized = str.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed (must be multiple of 4)
  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }

  return atob(normalized);
};

// Convert distance/speed to metric (km/kmh) if needed
const toKm = (val: number, unit?: string): number =>
  unit?.toLowerCase().includes("mi") ? val * 1.60934 : val;

const toKmh = (val: number, unit?: string): number =>
  unit?.toLowerCase().includes("mph") ? val * 1.60934 : val;

export const ScannerPage = ({ user, onBack }: ScannerPageProps) => {
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  const addWorkout = useAddWorkout(user);

  const parseHaloQRCode = (url: string): WorkoutInsert | null => {
    try {
      // Parse URL to extract the 'r' parameter
      const urlObj = new URL(url);
      const rParam = urlObj.searchParams.get("r");

      if (!rParam) {
        throw new Error("No 'r' parameter found in QR code");
      }

      // Decode URL-safe Base64
      const decoded = decodeUrlSafeBase64(rParam);
      const data: HaloWorkoutData = JSON.parse(decoded);

      // Prevent duplicate scans
      if (lastScannedId === data.id) {
        throw new Error("This workout has already been scanned");
      }

      // Parse workout data with unit conversion
      const workout: WorkoutInsert = {
        user_id: user.id,
        workout_id: data.id,
        workout_date: data.dt,
        duration_seconds: data.et ? parseInt(data.et, 10) : null,
        calories: data.c ? parseInt(data.c, 10) : null,
        distance_km: data.d ? toKm(parseFloat(data.d.v), data.d.u) : null,
        avg_speed_kmh: data.as ? toKmh(parseFloat(data.as.v), data.as.u) : null,
        avg_pace: data.ap?.v || null,
        avg_heart_rate: data.ahr ? parseInt(data.ahr, 10) : null,
        // Note: 'aw' field meaning is unclear (could be max HR or avg watts)
        // Leaving both null until confirmed from actual QR codes
        max_heart_rate: null,
        avg_watts: null,
        raw_data: data as unknown as Json,
      };

      return workout;
    } catch (err) {
      console.error("Error parsing QR code:", err);
      return null;
    }
  };

  const handleScan = async (decodedText: string) => {
    const workout = parseHaloQRCode(decodedText);

    if (!workout) {
      setStatus({
        type: "error",
        message: "Invalid QR code format. Please scan a Halo Fitness QR code.",
      });
      return;
    }

    try {
      await addWorkout.mutateAsync(workout);
      setLastScannedId(workout.workout_id);
      setStatus({
        type: "success",
        message: "Workout logged successfully! Scan another QR code to continue.",
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

  return (
    <main>
      <div className="scanner-page">
        <div className="page-header">
          <h1>Scan Workout QR Code</h1>
          <button onClick={onBack} className="btn-cancel">
            Back to Dashboard
          </button>
        </div>

        <section className="scanner-section">
          <p className="instructions">
            Point your camera at a Halo Fitness workout summary QR code to
            automatically log your workout.
          </p>

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

          <QRScanner onScan={handleScan} />
        </section>
      </div>
    </main>
  );
};
