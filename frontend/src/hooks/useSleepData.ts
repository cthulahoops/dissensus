import { useQuery } from "@tanstack/react-query";
import { sleepRecordsAPI } from "../lib/supabase";
import type { SleepRecord } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface SleepDataState {
  records: SleepRecord[];
  loading: boolean;
  error: string | null;
}

export function useSleepData(user: User): SleepDataState {
  const {
    data: records,
    isPending: loading,
    error,
  } = useQuery<SleepRecord[]>({
    queryKey: ["sleepRecords", user.id],
    queryFn: () => sleepRecordsAPI.getAll(user.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    records: records ?? [],
    loading: loading,
    error: error?.message || null,
  };
}
