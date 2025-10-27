import "./StatCard.css";

type StatCardProps = {
  value: React.ReactNode;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
