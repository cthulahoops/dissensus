import type { SleepRecord } from "./supabase";

// Configuration constants
export const ROLLING_AVERAGE_DAYS = 7;

// Utility functions (ported from your existing main.js)
export function parseTime(timeStr: string | null | undefined): number | null {
  if (!timeStr || timeStr === "null") return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

export function calculateTimeDifference(
  startTime: number,
  endTime: number,
): number | null {
  if (startTime == null || endTime == null) return null;
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
      totalTimeInBed = calculateTimeDifference(timeInBed, timeOutOfBed);
    }

    // Calculate total time asleep: (wake time - sleep attempt time) - time to fall asleep - time awake during night
    if (timeTriedToSleep !== null && finalAwakeningTime !== null) {
      const sleepPeriod = calculateTimeDifference(
        timeTriedToSleep,
        finalAwakeningTime,
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
      timeTryingToSleepMinutes,
      timeAwakeInNightMinutes: totalAwakeMinutes,
      woreBiteGuard:
        record.wore_bite_guard !== null
          ? record.wore_bite_guard
            ? 1
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

export type TimeRange = "all" | "30d" | "14d" | "7d";

export function filterRecordsByDateRange<T extends { date: string }>(
  records: T[],
  timeRange: TimeRange,
): T[] {
  if (timeRange === "all") {
    return records;
  }

  const now = new Date();
  const daysMap = {
    "7d": 7,
    "14d": 14,
    "30d": 30,
  };

  const daysToSubtract = daysMap[timeRange];
  const cutoffDate = new Date(now);
  cutoffDate.setDate(now.getDate() - daysToSubtract);
  cutoffDate.setHours(0, 0, 0, 0); // Start of the day

  return records.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= cutoffDate;
  });
}

export type DataKey = keyof Omit<ProcessedSleepData, "date">;

export function chartData(
  processedSleepData: ProcessedSleepData[],
  key: DataKey,
) {
  return {
    data: dataWithZeros(processedSleepData, key),
  };
}

function dataWithZeros(processedSleepData: ProcessedSleepData[], key: DataKey) {
  return processedSleepData.map((d) => ({
    date: d.date,
    value: d[key] ?? 0,
  }));
}

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

  const minDate = new Date(sortedData[0].date);
  const maxDate = new Date(sortedData[sortedData.length - 1].date);

  const filledData: ProcessedSleepData[] = [];
  const currentDate = new Date(minDate);

  while (currentDate <= maxDate) {
    const dateStr = currentDate.toISOString().split("T")[0];

    if (dataByDate.has(dateStr)) {
      filledData.push(dataByDate.get(dateStr)!);
    } else {
      filledData.push({
        date: dateStr,
        totalTimeInBed: null,
        totalTimeAsleep: null,
        sleepEfficiency: null,
        timeToFallAsleepMinutes: null,
        timeTryingToSleepMinutes: null,
        timeAwakeInNightMinutes: null,
        woreBiteGuard: null,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return filledData;
}

function dataAverages(data: ProcessedSleepData[], key: DataKey) {
  if (data.length === 0) return [];

  const dataWithZeros = data.map((d) => ({
    ...d,
    [key]: d[key] ?? 0,
  }));

  const filledData = fillMissingDates(dataWithZeros);

  const originalDateSet = new Set(data.map((d) => d.date));
  const originalIndices: number[] = [];

  filledData.forEach((d, index) => {
    if (originalDateSet.has(d.date)) {
      originalIndices.push(index);
    }
  });

  const filledValues = filledData.map((d) => d[key]);
  const allAverages = calculateRollingAverage(
    filledValues,
    ROLLING_AVERAGE_DAYS,
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
