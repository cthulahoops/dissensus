
import { SleepDashboard } from '../components/SleepDashboard';
import type { SleepRecord } from '../lib/supabase';

export const DashboardPage = ({
  onAddRecord,
  sleepRecords,
  loading,
  error,
}: {
  onAddRecord: () => void;
  sleepRecords: SleepRecord[];
  loading: boolean;
  error: string | null;
}) => {
  return (
    <SleepDashboard
      onAddRecord={onAddRecord}
      sleepRecords={sleepRecords}
      loading={loading}
      error={error}
    />
  );
};
