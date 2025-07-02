
import { SleepDashboard } from '../components/SleepDashboard';
import { useSleepDataContext } from '../contexts/useSleepDataContext';

export const DashboardPage = ({ onAddRecord }: { onAddRecord: () => void }) => {
  const { records: sleepRecords, loading, error } = useSleepDataContext();

  return (
    <SleepDashboard
      onAddRecord={onAddRecord}
      sleepRecords={sleepRecords}
      loading={loading}
      error={error}
    />
  );
};
