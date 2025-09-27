import { useQuery } from "@tanstack/react-query";
import { sleepRecordsAPI } from "../lib/supabase";
import type { SleepRecord } from "../lib/supabase";

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
