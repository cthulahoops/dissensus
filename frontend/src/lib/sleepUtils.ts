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

export interface ProcessedSleepData {
  date: string;
  totalTimeInBed: number | null;
  totalTimeAsleep: number | null;
  sleepEfficiency: number | null;
  timeToFallAsleepMinutes: number | null;
  timeTryingToSleepMinutes: number | null;
  timeAwakeInNightMinutes: number | null;
}

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
    };
  });
}

export function formatHoursMinutes(hours: number | null): string {
  if (hours === null || hours === undefined || isNaN(hours)) {
    return "N/A";
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export interface ChartDataPoint {
  date: string;
  value: number | null;
}

export type TimeRange = "all" | "30d" | "14d" | "7d";

export function filterRecordsByDateRange(
  records: SleepRecord[],
  timeRange: TimeRange,
): SleepRecord[] {
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

export function prepareChartData(processedData: ProcessedSleepData[]) {
  // Prepare data for charts - include all dates, but replace null with 0 for display
  const timeInBedData: ChartDataPoint[] = processedData.map((d) => ({
    date: d.date,
    value: d.totalTimeInBed ?? 0,
  }));

  const timeAsleepData: ChartDataPoint[] = processedData.map((d) => ({
    date: d.date,
    value: d.totalTimeAsleep ?? 0,
  }));

  const efficiencyData: ChartDataPoint[] = processedData.map((d) => ({
    date: d.date,
    value: d.sleepEfficiency ?? 0,
  }));

  const fallAsleepData: ChartDataPoint[] = processedData.map((d) => ({
    date: d.date,
    value: d.timeToFallAsleepMinutes ?? 0,
  }));

  const tryingToSleepData: ChartDataPoint[] = processedData.map((d) => ({
    date: d.date,
    value: d.timeTryingToSleepMinutes ?? 0,
  }));

  const timeAwakeInNightData: ChartDataPoint[] = processedData.map((d) => ({
    date: d.date,
    value: d.timeAwakeInNightMinutes ?? 0,
  }));

  // Calculate rolling averages - treat null values as zeros for proper trend calculation
  const timeInBedAvg = calculateRollingAverage(
    processedData.map((d) => d.totalTimeInBed ?? 0),
    ROLLING_AVERAGE_DAYS,
  );
  const timeAsleepAvg = calculateRollingAverage(
    processedData.map((d) => d.totalTimeAsleep ?? 0),
    ROLLING_AVERAGE_DAYS,
  );
  const efficiencyAvg = calculateRollingAverage(
    processedData.map((d) => d.sleepEfficiency ?? 0),
    ROLLING_AVERAGE_DAYS,
  );
  const fallAsleepAvg = calculateRollingAverage(
    processedData.map((d) => d.timeToFallAsleepMinutes ?? 0),
    ROLLING_AVERAGE_DAYS,
  );
  const tryingToSleepAvg = calculateRollingAverage(
    processedData.map((d) => d.timeTryingToSleepMinutes ?? 0),
    ROLLING_AVERAGE_DAYS,
  );
  const timeAwakeInNightAvg = calculateRollingAverage(
    processedData.map((d) => d.timeAwakeInNightMinutes ?? 0),
    ROLLING_AVERAGE_DAYS,
  );

  return {
    timeInBed: { data: timeInBedData, average: timeInBedAvg },
    timeAsleep: { data: timeAsleepData, average: timeAsleepAvg },
    efficiency: { data: efficiencyData, average: efficiencyAvg },
    fallAsleep: { data: fallAsleepData, average: fallAsleepAvg },
    tryingToSleep: { data: tryingToSleepData, average: tryingToSleepAvg },
    timeAwakeInNight: {
      data: timeAwakeInNightData,
      average: timeAwakeInNightAvg,
    },
  };
}
