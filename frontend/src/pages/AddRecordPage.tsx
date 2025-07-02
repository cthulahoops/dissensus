
import { SleepForm } from '../components/SleepForm';
import { useSleepDataContext } from '../contexts/useSleepDataContext';
import { useAuth } from '../hooks/useAuth';
import type { SleepRecordInsert } from '../lib/supabase';

export const AddRecordPage = ({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const { addRecord } = useSleepDataContext();
  const { user } = useAuth();

  const handleSubmit = async (record: SleepRecordInsert) => {
    if (!user) return;
    const newRecord = { ...record, user_id: user.id };
    const result = await addRecord(newRecord);
    if (result) {
      onSuccess();
    }
  };

  if (!user) return null; // Or a loading/error state

  return <SleepForm userId={user.id} onSubmit={handleSubmit} onCancel={onCancel} />;
};
