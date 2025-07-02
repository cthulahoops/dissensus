import { useMemo } from "react";
import { SleepForm } from "../components/SleepForm";
import { useSleepDataContext } from "../contexts/useSleepDataContext";
import { useAuth } from "../hooks/useAuth";
import type { SleepRecordInsert } from "../lib/supabase";

export const AddRecordPage = ({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const { addRecord, updateRecord, records } = useSleepDataContext();
  const { user } = useAuth();

  // Check if today's record exists
  const todaysRecord = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return records.find((record) => record.date === today);
  }, [records]);

  const handleSubmit = async (record: SleepRecordInsert) => {
    if (!user) return;

    if (todaysRecord) {
      // Update existing record
      await updateRecord(todaysRecord.id, { ...record, user_id: user.id });
    } else {
      // Create new record
      const newRecord = { ...record, user_id: user.id };
      const result = await addRecord(newRecord);
      if (!result) return;
    }

    onSuccess();
  };

  if (!user) return null; // Or a loading/error state

  return (
    <SleepForm
      userId={user.id}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      existingRecord={todaysRecord}
    />
  );
};
