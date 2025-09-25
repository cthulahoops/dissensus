import type { TimeRange } from "../lib/sleepUtils";

type TimeRangeSelectorProps = {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
};

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  const timeRangeOptions = [
    { value: "all" as const, label: "All Time" },
    { value: 30, label: "Last 30 Days" },
    { value: 14, label: "Last 14 Days" },
    { value: 7, label: "Last 7 Days" },
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
}
