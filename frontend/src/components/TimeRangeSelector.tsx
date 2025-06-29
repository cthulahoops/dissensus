import React from "react";

export type TimeRange = "all" | "30d" | "14d" | "7d";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
}) => {
  const timeRangeOptions = [
    { value: "all" as const, label: "All Time" },
    { value: "30d" as const, label: "Last 30 Days" },
    { value: "14d" as const, label: "Last 14 Days" },
    { value: "7d" as const, label: "Last 7 Days" },
  ];

  return (
    <div className="time-range-selector">
      <label htmlFor="time-range">Time Range:</label>
      <select
        id="time-range"
        value={selectedRange}
        onChange={(e) => onRangeChange(e.target.value as TimeRange)}
        className="time-range-select"
      >
        {timeRangeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
