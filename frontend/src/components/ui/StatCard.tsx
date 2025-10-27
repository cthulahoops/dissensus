import "./StatCard.css";
import { formatHoursMinutes } from "../../lib/sleepUtils";

type StatValue =
  | string
  | {
      value: number | null;
      unit: "hours" | "percent" | "minutes" | "km";
    };

type StatCardProps = {
  value: StatValue;
  label: string;
};

function formatValue(val: StatValue): string {
  // If it's already a string, return as-is
  if (typeof val === "string") {
    return val;
  }

  // Handle unit formatting
  const { value, unit } = val;

  if (value === null) {
    return "N/A";
  }

  switch (unit) {
    case "hours":
      return formatHoursMinutes(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "minutes":
      return `${Math.round(value)} min`;
    case "km":
      return `${value.toFixed(2)} km`;
    default:
      return value.toString();
  }
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat-card card">
      <div className="stat-value">{formatValue(value)}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
