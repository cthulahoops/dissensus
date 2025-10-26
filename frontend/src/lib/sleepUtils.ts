import type { SleepRecord } from "./supabase";
import { Temporal } from "temporal-polyfill";

// Configuration constants
export const COMPOSITE_AVERAGE_WINDOWS = [5, 7, 9];

// Utility functions (ported from your existing main.js)
export function parseTime(timeStr: string | null | undefined): number | null {
  if (!timeStr || timeStr === "null") return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

export function calculateTimeDifference(
  startTime: number,
  endTime: number,
  date?: string,
): number | null {
  if (startTime == null || endTime == null) return null;

  // If we have a date, use proper date-time calculation to handle DST
  if (date) {
    try {
      const wakeDate = Temporal.PlainDate.from(date);

      // Convert decimal hours to hours and minutes
      const startHours = Math.floor(startTime);
      const startMinutes = Math.round((startTime - startHours) * 60);
      const endHours = Math.floor(endTime);
      const endMinutes = Math.round((endTime - endHours) * 60);

      // Determine if start time is on the previous day
      // If endTime < startTime, it's overnight, so start time was yesterday
      const sleepDate = endTime < startTime
        ? wakeDate.subtract({ days: 1 })
        : wakeDate;

      // Create PlainDateTime objects
      const startDateTime = sleepDate.toPlainDateTime({
        hour: startHours,
        minute: startMinutes,
      });
      const endDateTime = wakeDate.toPlainDateTime({
        hour: endHours,
        minute: endMinutes,
      });

      // Convert to ZonedDateTime in the system timezone
      const timeZone = Temporal.Now.timeZoneId();
      const startZoned = startDateTime.toZonedDateTime(timeZone);
      const endZoned = endDateTime.toZonedDateTime(timeZone);

      // Calculate the duration
      const duration = startZoned.until(endZoned);

      // Convert to decimal hours
      const totalHours = duration.total('hours');
      return totalHours;
    } catch (error) {
      console.error('Error calculating time difference with DST:', error);
      // Fall back to simple arithmetic if there's an error
    }
  }

  // Fallback: simple arithmetic (pre-DST fix behavior)
  let diff = endTime - startTime;
  if (diff < 0) diff += 24; // Handle overnight
  return diff;
}

export type ProcessedSleepData = {
  date: string;
  totalTimeInBed: number | null;
  totalTimeAsleep: number | null;
  sleepEfficiency: number | null;
  timeToFallAsleepMinutes: number | null;
  timeTryingToSleepMinutes: number | null;
  timeAwakeInNightMinutes: number | null;
  woreBiteGuard: number | null;
};

export function processData(sleepData: SleepRecord[]): ProcessedSleepData[] {
  return sleepData.map((record) => {
    const timeInBed = parseTime(record.time_got_into_bed);
    const timeOutOfBed = parseTime(record.time_got_out_of_bed);
    const timeTriedToSleep = parseTime(record.time_tried_to_sleep);
    const finalAwakeningTime = parseTime(record.final_awakening_time);
    const totalAwakeMinutes = record.total_awake_time_mins || 0;
    const timeToFallAsleepMinutes = record.time_to_fall_asleep_mins || null;
    const timeTryingToSleepMinutes =
      record.time_trying_to_sleep_after_final_awakening_mins || null;

    let totalTimeInBed: number | null = null;
    let totalTimeAsleep: number | null = null;
    let sleepEfficiency: number | null = null;

    // Calculate total time in bed
    if (timeInBed !== null && timeOutOfBed !== null) {
      totalTimeInBed = calculateTimeDifference(timeInBed, timeOutOfBed, record.date);
    }

    // Calculate total time asleep: (wake time - sleep attempt time) - time to fall asleep - time awake during night
    if (timeTriedToSleep !== null && finalAwakeningTime !== null) {
      const sleepPeriod = calculateTimeDifference(
        timeTriedToSleep,
        finalAwakeningTime,
        record.date,
      );
      if (sleepPeriod !== null) {
        const timeToFallAsleepHours = (timeToFallAsleepMinutes || 0) / 60;
        const totalAwakeHours = totalAwakeMinutes / 60;
        totalTimeAsleep = sleepPeriod - timeToFallAsleepHours - totalAwakeHours;

        // Ensure we don't have negative sleep time
        if (totalTimeAsleep < 0) {
          totalTimeAsleep = 0;
        }
      }
    }

    // Calculate sleep efficiency
    if (
      totalTimeAsleep !== null &&
      totalTimeInBed !== null &&
      totalTimeInBed > 0
    ) {
      sleepEfficiency = (totalTimeAsleep / totalTimeInBed) * 100;
    }

    return {
      date: record.date,
      totalTimeInBed,
      totalTimeAsleep,
      sleepEfficiency,
      timeToFallAsleepMinutes,
      timeTryingToSleepMinutes: timeTryingToSleepMinutes ?? 0,
      timeAwakeInNightMinutes: totalAwakeMinutes ?? 0,
      woreBiteGuard:
        typeof record.wore_bite_guard === "boolean"
          ? record.wore_bite_guard
            ? 100
            : 0
          : null,
    };
  });
}

export function formatHoursMinutes(hours: number | null): string {
  if (hours === null || isNaN(hours)) {
    return "N/A";
  }
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export interface ChartDataPoint {
  date: string;
  value: number | null;
}

export type TimeRange = "all" | number;

export function filterRecordsByDateRange<T extends { date: string }>(
  records: T[],
  timeRange: TimeRange,
): T[] {
  if (timeRange === "all") {
    return records;
  }

  const today = Temporal.Now.plainDateISO();
  const cutoffDate = today.subtract({ days: timeRange });
  const cutoffDateStr = cutoffDate.toString(); // Already in YYYY-MM-DD format

  return records.filter((record) => {
    return record.date > cutoffDateStr;
  });
}

export type DataKey = keyof Omit<ProcessedSleepData, "date">;

export type AveragedData = {
  totalTimeInBed: (number | null)[];
  totalTimeAsleep: (number | null)[];
  sleepEfficiency: (number | null)[];
  timeToFallAsleepMinutes: (number | null)[];
  timeAwakeInNightMinutes: (number | null)[];
  timeTryingToSleepMinutes: (number | null)[];
  woreBiteGuard: (number | null)[];
};

export function getAveragedData(data: ProcessedSleepData[]): AveragedData {
  return {
    totalTimeInBed: dataAverages(data, "totalTimeInBed"),
    totalTimeAsleep: dataAverages(data, "totalTimeAsleep"),
    sleepEfficiency: dataAverages(data, "sleepEfficiency"),
    timeToFallAsleepMinutes: dataAverages(data, "timeToFallAsleepMinutes"),
    timeAwakeInNightMinutes: dataAverages(data, "timeAwakeInNightMinutes"),
    timeTryingToSleepMinutes: dataAverages(data, "timeTryingToSleepMinutes"),
    woreBiteGuard: dataAverages(data, "woreBiteGuard"),
  };
}

function fillMissingDates(data: ProcessedSleepData[]): ProcessedSleepData[] {
  if (data.length === 0) return [];

  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const dataByDate = new Map(sortedData.map((d) => [d.date, d]));

  let current = Temporal.PlainDate.from(sortedData[0].date);
  const end = Temporal.PlainDate.from(sortedData[sortedData.length - 1].date);

  const filled: ProcessedSleepData[] = [];
  while (Temporal.PlainDate.compare(current, end) <= 0) {
    const dateStr = current.toString();
    filled.push(
      dataByDate.get(dateStr) ?? {
        date: dateStr,
        totalTimeInBed: null,
        totalTimeAsleep: null,
        sleepEfficiency: null,
        timeToFallAsleepMinutes: null,
        timeTryingToSleepMinutes: null,
        timeAwakeInNightMinutes: null,
        woreBiteGuard: null,
      },
    );
    current = current.add({ days: 1 });
  }
  return filled;
}

function dataAverages(data: ProcessedSleepData[], key: DataKey) {
  if (data.length === 0) return [];

  const filledData = fillMissingDates(data);

  const originalDateSet = new Set(data.map((d) => d.date));
  const originalIndices: number[] = [];

  filledData.forEach((d, index) => {
    if (originalDateSet.has(d.date)) {
      originalIndices.push(index);
    }
  });

  const filledValues = filledData.map((d) => d[key]);
  const allAverages = calculateCompositeAverage(
    filledValues,
    COMPOSITE_AVERAGE_WINDOWS,
  );

  return originalIndices.map((index) => allAverages[index]);
}

export function calculateRollingAverage(
  data: (number | null)[],
  windowSize: number,
): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data
      .slice(start, i + 1)
      .filter((val) => val !== null && !isNaN(val)) as number[];
    if (window.length > 0) {
      result.push(window.reduce((sum, val) => sum + val, 0) / window.length);
    } else {
      result.push(null);
    }
  }
  return result;
}

/**
 * Calculates a composite rolling average by averaging multiple moving averages.
 * This technique provides better smoothing and reduces lag compared to a single long-period average.
 *
 * @param data - Array of values (can include nulls)
 * @param windowSizes - Array of window sizes to average together (e.g., [5, 7, 9])
 * @returns Array of composite averaged values
 */
export function calculateCompositeAverage(
  data: (number | null)[],
  windowSizes: number[],
): (number | null)[] {
  if (windowSizes.length === 0) {
    return data.map(() => null);
  }

  // Calculate moving average for each window size
  const allAverages = windowSizes.map((windowSize) =>
    calculateRollingAverage(data, windowSize)
  );

  // Average the averages for each point
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    const values = allAverages
      .map((avg) => avg[i])
      .filter((val) => val !== null && !isNaN(val)) as number[];

    if (values.length > 0) {
      result.push(values.reduce((sum, val) => sum + val, 0) / values.length);
    } else {
      result.push(null);
    }
  }

  return result;
}

export function getLatestAverage(averages: AveragedData, key: DataKey) {
  const averageArray = averages[key];

  if (averageArray.length === 0) return null;
  // Find the last non-null value
  for (let i = averageArray.length - 1; i >= 0; i--) {
    if (averageArray[i] !== null) {
      return averageArray[i];
    }
  }
  return null;
}
