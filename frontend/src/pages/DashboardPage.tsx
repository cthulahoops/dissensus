import { SleepDashboard } from "../components/SleepDashboard";
import { useSleepData } from "../hooks/useSleepData";
import { useAuth } from "../hooks/useAuth";

export const DashboardPage = ({ onAddRecord }: { onAddRecord: () => void }) => {
  const { user } = useAuth();
  const { records: sleepRecords, loading, error } = useSleepData(user?.id);

  return (
    <SleepDashboard
      onAddRecord={onAddRecord}
      sleepRecords={sleepRecords}
      loading={loading}
      error={error}
    />
  );
};
