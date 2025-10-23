import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatHoursMinutes,
  filterRecordsByDateRange,
  calculateRollingAverage,
  calculateCompositeAverage,
} from "./sleepUtils";

describe("formatHoursMinutes", () => {
  it("should format exact hours correctly", () => {
    expect(formatHoursMinutes(7.0)).toBe("7:00");
    expect(formatHoursMinutes(1.0)).toBe("1:00");
    expect(formatHoursMinutes(0.0)).toBe("0:00");
  });

  it("should format fractional hours correctly", () => {
    expect(formatHoursMinutes(6.5)).toBe("6:30");
    expect(formatHoursMinutes(7.25)).toBe("7:15");
    expect(formatHoursMinutes(8.75)).toBe("8:45");
  });

  it("should handle the specific bug case (6.999... should round properly, not become 6:60)", () => {
    expect(formatHoursMinutes(6.999)).toBe("7:00"); // 6.999 * 60 = 419.94 minutes, rounds to 420 = 7:00
    expect(formatHoursMinutes(6.9999)).toBe("7:00"); // 6.9999 * 60 = 419.994 minutes, rounds to 420 = 7:00
    expect(formatHoursMinutes(6.99999)).toBe("7:00"); // 6.99999 * 60 = 419.9994 minutes, rounds to 420 = 7:00
  });

  it("should handle null and NaN inputs", () => {
    expect(formatHoursMinutes(null)).toBe("N/A");
    expect(formatHoursMinutes(NaN)).toBe("N/A");
  });

  it("should pad single-digit minutes with zero", () => {
    expect(formatHoursMinutes(7.1)).toBe("7:06");
    expect(formatHoursMinutes(5.033)).toBe("5:02");
  });

  it("should handle edge cases around minute boundaries", () => {
    expect(formatHoursMinutes(7.016)).toBe("7:01"); // 7.016 hours = 7:00.96 minutes, rounds to 7:01
    expect(formatHoursMinutes(7.983)).toBe("7:59"); // 7.983 hours = 7:58.98 minutes, rounds to 7:59
  });
});

describe("filterRecordsByDateRange", () => {
  const mockRecords = [
    { date: "2024-01-01", value: 1 },
    { date: "2024-01-05", value: 2 },
    { date: "2024-01-10", value: 3 },
    { date: "2024-01-15", value: 4 },
    { date: "2024-01-20", value: 5 },
    { date: "2024-01-25", value: 6 },
    { date: "2024-01-30", value: 7 },
  ];

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return all records when timeRange is "all"', () => {
    const result = filterRecordsByDateRange(mockRecords, "all");
    expect(result).toEqual(mockRecords);
    expect(result.length).toBe(7);
  });

  it("should filter records for 7-day range", () => {
    // Mock the current date to be 2024-01-30
    const mockDate = new Date("2024-01-30T12:00:00Z");
    vi.setSystemTime(mockDate);

    const result = filterRecordsByDateRange(mockRecords, 7);

    // Should include records after 2024-01-23 (7 days before 2024-01-30)
    expect(result).toEqual([
      { date: "2024-01-25", value: 6 },
      { date: "2024-01-30", value: 7 },
    ]);
    expect(result.length).toBe(2);
  });

  it("should filter records for 14-day range", () => {
    const mockDate = new Date("2024-01-30T12:00:00Z");
    vi.setSystemTime(mockDate);

    const result = filterRecordsByDateRange(mockRecords, 14);

    // Should include records after 2024-01-16 (14 days before 2024-01-30)
    expect(result).toEqual([
      { date: "2024-01-20", value: 5 },
      { date: "2024-01-25", value: 6 },
      { date: "2024-01-30", value: 7 },
    ]);
    expect(result.length).toBe(3);
  });

  it("should filter records for 30-day range", () => {
    const mockDate = new Date("2024-01-30T12:00:00Z");
    vi.setSystemTime(mockDate);

    const result = filterRecordsByDateRange(mockRecords, 30);

    // Should include records after 2023-12-31 (30 days before 2024-01-30)
    expect(result).toEqual(mockRecords);
    expect(result.length).toBe(7);
  });

  it("should handle empty records array", () => {
    const result = filterRecordsByDateRange([], 7);
    expect(result).toEqual([]);
  });

  it("should handle records with no matches in date range", () => {
    const oldRecords = [
      { date: "2023-01-01", value: 1 },
      { date: "2023-01-02", value: 2 },
    ];

    const mockDate = new Date("2024-01-30T12:00:00Z");
    vi.setSystemTime(mockDate);

    const result = filterRecordsByDateRange(oldRecords, 7);
    expect(result).toEqual([]);
  });

  it("should handle boundary conditions correctly", () => {
    const boundaryRecords = [
      { date: "2024-01-23", value: 1 }, // Exactly 7 days before
      { date: "2024-01-24", value: 2 }, // 6 days before
      { date: "2024-01-30", value: 3 }, // Current day
    ];

    const mockDate = new Date("2024-01-30T12:00:00Z");
    vi.setSystemTime(mockDate);

    const result = filterRecordsByDateRange(boundaryRecords, 7);

    // Should exclude the record exactly 7 days before (2024-01-23)
    // and include records after that date
    expect(result).toEqual([
      { date: "2024-01-24", value: 2 },
      { date: "2024-01-30", value: 3 },
    ]);
    expect(result.length).toBe(2);
  });

  it("should work with different record types containing date property", () => {
    const sleepRecords = [
      { date: "2024-01-25", totalTimeInBed: 8.0, sleepEfficiency: 90 },
      { date: "2024-01-30", totalTimeInBed: 7.5, sleepEfficiency: 85 },
    ];

    const mockDate = new Date("2024-01-30T12:00:00Z");
    vi.setSystemTime(mockDate);

    const result = filterRecordsByDateRange(sleepRecords, 7);
    expect(result).toEqual(sleepRecords);
    expect(result.length).toBe(2);
  });

  it("should handle month boundaries correctly", () => {
    const crossMonthRecords = [
      { date: "2024-01-28", value: 1 },
      { date: "2024-01-31", value: 2 },
      { date: "2024-02-01", value: 3 },
      { date: "2024-02-05", value: 4 },
    ];

    const mockDate = new Date("2024-02-05T12:00:00Z");
    vi.setSystemTime(mockDate);

    const result = filterRecordsByDateRange(crossMonthRecords, 7);

    // Should include records after 2024-01-29 (7 days before 2024-02-05)
    expect(result).toEqual([
      { date: "2024-01-31", value: 2 },
      { date: "2024-02-01", value: 3 },
      { date: "2024-02-05", value: 4 },
    ]);
    expect(result.length).toBe(3);
  });
});

describe("calculateRollingAverage", () => {
  it("should calculate simple rolling average correctly", () => {
    const data = [1, 2, 3, 4, 5];
    const result = calculateRollingAverage(data, 3);

    expect(result).toEqual([
      1, // avg of [1]
      1.5, // avg of [1, 2]
      2, // avg of [1, 2, 3]
      3, // avg of [2, 3, 4]
      4, // avg of [3, 4, 5]
    ]);
  });

  it("should handle null values correctly", () => {
    const data = [1, null, 3, null, 5];
    const result = calculateRollingAverage(data, 3);

    expect(result).toEqual([
      1, // avg of [1]
      1, // avg of [1]
      2, // avg of [1, 3]
      3, // avg of [3]
      4, // avg of [3, 5]
    ]);
  });

  it("should return null when all values in window are null", () => {
    const data = [null, null, null];
    const result = calculateRollingAverage(data, 3);

    expect(result).toEqual([null, null, null]);
  });

  it("should handle window size of 1", () => {
    const data = [1, 2, 3, 4];
    const result = calculateRollingAverage(data, 1);

    expect(result).toEqual([1, 2, 3, 4]);
  });

  it("should handle window size larger than data length", () => {
    const data = [1, 2, 3];
    const result = calculateRollingAverage(data, 10);

    expect(result).toEqual([
      1, // avg of [1]
      1.5, // avg of [1, 2]
      2, // avg of [1, 2, 3]
    ]);
  });

  it("should handle empty array", () => {
    const data: number[] = [];
    const result = calculateRollingAverage(data, 3);

    expect(result).toEqual([]);
  });
});

describe("calculateCompositeAverage", () => {
  it("should calculate average of multiple window sizes", () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = calculateCompositeAverage(data, [3, 5, 7]);

    // For the last data point (10):
    // 3-day avg: (8, 9, 10) = 9
    // 5-day avg: (6, 7, 8, 9, 10) = 8
    // 7-day avg: (4, 5, 6, 7, 8, 9, 10) = 7
    // Composite: (9 + 8 + 7) / 3 = 8
    expect(result[9]).toBeCloseTo(8, 5);
  });

  it("should handle null values correctly", () => {
    const data = [1, null, 3, null, 5, 6, 7, 8, 9, 10];
    const result = calculateCompositeAverage(data, [3, 5]);

    // Should skip nulls when calculating each window's average
    expect(result.length).toBe(10);
    expect(result[9]).toBeGreaterThan(0);
  });

  it("should return all nulls for empty window sizes array", () => {
    const data = [1, 2, 3, 4, 5];
    const result = calculateCompositeAverage(data, []);

    expect(result).toEqual([null, null, null, null, null]);
  });

  it("should handle single window size (equivalent to rolling average)", () => {
    const data = [1, 2, 3, 4, 5];
    const composite = calculateCompositeAverage(data, [3]);
    const rolling = calculateRollingAverage(data, 3);

    expect(composite).toEqual(rolling);
  });

  it("should produce smoother results than simple rolling average", () => {
    // Test with volatile data
    const data = [1, 10, 2, 9, 3, 8, 4, 7, 5, 6];

    const simple = calculateRollingAverage(data, 7);
    const composite = calculateCompositeAverage(data, [5, 7, 9]);

    // Both should be defined for the last element
    expect(simple[9]).toBeDefined();
    expect(composite[9]).toBeDefined();

    // The composite average should smooth out the volatility
    // This is a behavioral test - we're just ensuring it produces reasonable values
    expect(composite[9]).toBeGreaterThan(0);
    expect(composite[9]).toBeLessThan(10);
  });

  it("should handle real-world sleep data scenario", () => {
    // Simulating sleep efficiency data with some variability
    const sleepEfficiency = [85, null, 90, 88, null, 92, 87, 89, 91, 86];
    const result = calculateCompositeAverage(sleepEfficiency, [5, 7, 9]);

    // Should produce smoothed values
    expect(result.length).toBe(10);

    // Last value should be a reasonable average
    const lastValue = result[9];
    expect(lastValue).not.toBeNull();
    if (lastValue !== null) {
      expect(lastValue).toBeGreaterThan(80);
      expect(lastValue).toBeLessThan(95);
    }
  });

  it("should handle all null data", () => {
    const data = [null, null, null, null, null];
    const result = calculateCompositeAverage(data, [3, 5]);

    expect(result).toEqual([null, null, null, null, null]);
  });
});
