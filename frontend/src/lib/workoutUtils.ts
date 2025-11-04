import type { WorkoutInsert } from "./supabase";
import type { Json } from "../database.types";

export interface HaloWorkoutData {
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

// Validation constants
const HEART_RATE_MIN = 30;
const HEART_RATE_MAX = 250;
const DURATION_MAX_SECONDS = 86400; // 24 hours
const CALORIES_MAX = 10000;

// Decode URL-safe Base64 (handles '-', '_', and missing padding)
export const decodeUrlSafeBase64 = (str: string): string => {
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

/**
 * Parse a Halo Fitness QR code URL and extract workout data
 * @param url - The URL from the QR code or pasted link
 * @param userId - The user ID to associate with the workout
 * @returns WorkoutInsert object or null if parsing fails
 */
export const parseHaloQRCodeURL = (
  url: string,
  userId: string
): WorkoutInsert | null => {
  try {
    // Parse URL to extract the 'r' parameter
    const urlObj = new URL(url);
    const rParam = urlObj.searchParams.get("r");

    if (!rParam) {
      throw new Error("No 'r' parameter found in QR code URL");
    }

    // Decode URL-safe Base64
    const decoded = decodeUrlSafeBase64(rParam);
    const data: HaloWorkoutData = JSON.parse(decoded);

    return parseHaloWorkoutData(data, userId);
  } catch (err) {
    console.error("Error parsing QR code URL:", err);
    return null;
  }
};

/**
 * Convert Halo workout data to WorkoutInsert format
 * @param data - Decoded Halo workout data
 * @param userId - The user ID to associate with the workout
 * @returns WorkoutInsert object
 * @throws Error if data is invalid
 */
export const parseHaloWorkoutData = (
  data: HaloWorkoutData,
  userId: string
): WorkoutInsert => {
  // Validate required fields
  if (!data.id || typeof data.id !== "string") {
    throw new Error("Invalid workout data: missing or invalid workout ID");
  }

  if (!data.dt || typeof data.dt !== "string") {
    throw new Error("Invalid workout data: missing or invalid date");
  }

  // Validate date is parseable
  const date = new Date(data.dt);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid workout data: date format is invalid");
  }

  // Validate numeric ranges if present
  if (data.ahr) {
    const hr = parseInt(data.ahr, 10);
    if (isNaN(hr) || hr < HEART_RATE_MIN || hr > HEART_RATE_MAX) {
      throw new Error(
        `Invalid workout data: average heart rate out of valid range (${HEART_RATE_MIN}-${HEART_RATE_MAX})`
      );
    }
  }

  if (data.et) {
    const duration = parseInt(data.et, 10);
    if (isNaN(duration) || duration < 0 || duration > DURATION_MAX_SECONDS) {
      throw new Error(
        "Invalid workout data: duration out of valid range (0-24 hours)"
      );
    }
  }

  if (data.c) {
    const calories = parseInt(data.c, 10);
    if (isNaN(calories) || calories < 0 || calories > CALORIES_MAX) {
      throw new Error(
        `Invalid workout data: calories out of valid range (0-${CALORIES_MAX})`
      );
    }
  }

  return {
    user_id: userId,
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
};

/**
 * Create a manual workout entry
 * @param params - Manual workout parameters
 * @param userId - The user ID to associate with the workout
 * @returns WorkoutInsert object
 */
export const createManualWorkout = (
  params: {
    date: string; // ISO date string
    workoutType: string; // Type of workout (run, swim, bike, etc.)
    durationMinutes?: number;
    calories?: number;
    distanceKm?: number;
    avgSpeedKmh?: number;
    avgPace?: string;
    avgHeartRate?: number;
    maxHeartRate?: number;
    avgWatts?: number;
  },
  userId: string
): WorkoutInsert => {
  // Generate a unique workout ID for manual entries using crypto.randomUUID()
  const workoutId = `manual-${crypto.randomUUID()}`;

  return {
    user_id: userId,
    workout_id: workoutId,
    workout_date: params.date,
    workout_type: params.workoutType,
    duration_seconds: params.durationMinutes
      ? params.durationMinutes * 60
      : null,
    calories: params.calories ?? null,
    distance_km: params.distanceKm ?? null,
    avg_speed_kmh: params.avgSpeedKmh ?? null,
    avg_pace: params.avgPace ?? null,
    avg_heart_rate: params.avgHeartRate ?? null,
    max_heart_rate: params.maxHeartRate ?? null,
    avg_watts: params.avgWatts ?? null,
    raw_data: { manual: true, ...params } as unknown as Json,
  };
};

/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 */
export const formatDuration = (seconds: number | null): string => {
  if (seconds === null) return "N/A";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};
