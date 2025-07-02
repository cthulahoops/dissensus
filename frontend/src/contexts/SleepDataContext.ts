import { createContext } from "react";
import type { SleepRecord, SleepRecordInsert } from "../lib/supabase";

export interface SleepDataContextValue {
  records: SleepRecord[];
  loading: boolean;
  error: string | null;
  addRecord: (record: SleepRecordInsert) => Promise<SleepRecord | null>;
  refetch: () => void;
  deleteRecord: (id: string) => Promise<void>;
  updateRecord: (id: string, updates: Partial<SleepRecord>) => Promise<void>;
}

export const SleepDataContext = createContext<
  SleepDataContextValue | undefined
>(undefined);
