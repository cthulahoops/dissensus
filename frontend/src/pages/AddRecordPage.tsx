
import { SleepForm } from '../components/SleepForm';
import type { SleepRecordInsert } from '../lib/supabase';

export const AddRecordPage = ({
  userId,
  onSubmit,
  onCancel,
}: {
  userId: string;
  onSubmit: (record: SleepRecordInsert) => void;
  onCancel: () => void;
}) => {
  return <SleepForm userId={userId} onSubmit={onSubmit} onCancel={onCancel} />;
};
