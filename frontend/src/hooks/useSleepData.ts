import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sleepRecordsAPI } from "../lib/supabase";
import type { SleepRecord, SleepRecordInsert } from "../lib/supabase";

interface SleepDataState {
  records: SleepRecord[];
  loading: boolean;
  error: string | null;
}

export function useSleepData(userId: string | undefined): SleepDataState {
  const {
    data: records,
    isPending: loading,
    error,
  } = useQuery<SleepRecord[]>({
    queryKey: ["sleepRecords", userId],
    queryFn: () => sleepRecordsAPI.getAll(userId!),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });

  return {
    records: records ?? [],
    loading: loading,
    error: error?.message || null,
  };
}

export function useSleepMutations(userId: string): {
  loading: boolean;
  error: string | null;
  addRecord: (record: SleepRecordInsert) => Promise<SleepRecord | null>;
  deleteRecord: (id: string) => Promise<void>;
  updateRecord: (
    id: string,
    updates: Partial<SleepRecord>,
  ) => Promise<SleepRecord>;
} {
  const queryClient = useQueryClient();

  const addRecordMutation = useMutation({
    mutationFn: (record: SleepRecordInsert) => sleepRecordsAPI.create(record),
    onSuccess: (newRecord: SleepRecord) => {
      queryClient.setQueryData(
        ["sleepRecords", userId],
        (old: SleepRecord[]) => (old ? [...old, newRecord] : [newRecord]),
      );
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: (id: string) => sleepRecordsAPI.delete(id),
    onSuccess: (_: void, id: string) => {
      queryClient.setQueryData(
        ["sleepRecords", userId],
        (old: SleepRecord[]) => old?.filter((r) => r.id !== id) || [],
      );
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<SleepRecord>;
    }) => sleepRecordsAPI.update(id, updates),
    onSuccess: (updatedRecord: SleepRecord) => {
      queryClient.setQueryData(
        ["sleepRecords", userId],
        (old: SleepRecord[]) =>
          old?.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)) ||
          [],
      );
    },
  });

  return {
    loading:
      addRecordMutation.isPending ||
      deleteRecordMutation.isPending ||
      updateRecordMutation.isPending,
    error:
      addRecordMutation.error?.message ||
      deleteRecordMutation.error?.message ||
      updateRecordMutation.error?.message ||
      null,
    addRecord: addRecordMutation.mutateAsync,
    deleteRecord: deleteRecordMutation.mutateAsync,
    updateRecord: (id: string, updates: Partial<SleepRecord>) =>
      updateRecordMutation.mutateAsync({ id, updates }),
  };
}
