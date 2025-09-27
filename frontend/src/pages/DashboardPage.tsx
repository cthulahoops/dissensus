import { SleepDashboard } from "../components/SleepDashboard";
import { useSleepData } from "../hooks/useSleepData";
import type { User } from "@supabase/supabase-js";

type DashboardPageProps = {
  user: User;
  onAddRecord: () => void;
};

export const DashboardPage = ({ user, onAddRecord }: DashboardPageProps) => {
  const { records: sleepRecords, loading, error } = useSleepData(user);

  return (
    <SleepDashboard
      onAddRecord={onAddRecord}
      sleepRecords={sleepRecords}
      loading={loading}
      error={error}
    />
  );
};
