import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { SleepForm } from "../components/SleepForm";
import { useSleepData } from "../hooks/useSleepData";
import type { SleepRecord, SleepRecordInsert } from "../lib/supabase";
import { sleepRecordsAPI } from "../lib/supabase";

export const AddRecordPage = ({
  user,
  onSuccess,
  onCancel,
}: {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const { records } = useSleepData(user);
  const addRecord = useAddRecord(user);
  const updateRecord = useUpdateRecord(user);

  // Check if today's record exists
  const todaysRecord = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return records.find((record) => record.date === today);
  }, [records]);

  const handleSubmit = async (record: SleepRecordInsert) => {
    if (todaysRecord) {
      // Update existing record
      await updateRecord.mutateAsync({
        id: todaysRecord.id,
        updates: { ...record, user_id: user.id },
      });
    } else {
      // Create new record
      const newRecord = { ...record, user_id: user.id };
      const result = await addRecord.mutateAsync(newRecord);
      if (!result) return;
    }

    onSuccess();
  };
  return (
    <SleepForm
      userId={user.id}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      existingRecord={todaysRecord}
    />
  );
};

function useAddRecord(user: User) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: SleepRecordInsert) => sleepRecordsAPI.create(record),
    onSuccess: (newRecord: SleepRecord) => {
      queryClient.setQueryData(
        ["sleepRecords", user.id],
        (old: SleepRecord[]) =>
          old ? sortRecordsByDate([...old, newRecord]) : [newRecord],
      );
    },
  });
}

function useUpdateRecord(user: User) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<SleepRecord>;
    }) => sleepRecordsAPI.update(id, updates),
    onSuccess: (updatedRecord: SleepRecord) => {
      queryClient.setQueryData(
        ["sleepRecords", user.id],
        (old: SleepRecord[]) =>
          sortRecordsByDate(
            old?.map((r) =>
              r.id === updatedRecord.id ? updatedRecord : r,
            ) ?? [updatedRecord],
          ),
      );
    },
  });
}

function sortRecordsByDate(records: SleepRecord[]): SleepRecord[] {
  // Date format is YYYY-MM-DD, so string comparison works for sorting.
  return records.slice().sort((a, b) => a.date.localeCompare(b.date));
}
