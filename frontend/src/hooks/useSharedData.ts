import { supabase, type SleepRecord } from "../lib/supabase";
import { useQuery } from "@tanstack/react-query";

export function useSharedData(token: string) {
  return useQuery<SleepRecord[]>({
    queryKey: ["sharedSleepRecords", token],
    queryFn: () => loadSharedData(token),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

async function loadSharedData(token: string) {
  // Use a stored procedure that sets the token and fetches data in one transaction
  // The RPC function will validate the token internally and throw an error if invalid
  const { data: records, error: fetchError } = await supabase.rpc(
    "fetch_shared_sleep_records",
    { share_token: token },
  );

  if (fetchError) {
    throw fetchError;
  }

  // If we get here, the token is valid (even if no records exist)
  return records || [];
}
