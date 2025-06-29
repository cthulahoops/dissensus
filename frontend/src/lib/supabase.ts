import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

type TableName = keyof Database["public"]["Tables"];

export type Selectable<T extends TableName> =
  Database["public"]["Tables"][T]["Row"];

export type Insertable<T extends TableName> =
  Database["public"]["Tables"][T]["Insert"];

export type Updateable<T extends TableName> =
  Database["public"]["Tables"][T]["Update"];

export type SleepRecord = Selectable<"sleep_records">;
export type SleepRecordInsert = Insertable<"sleep_records">;
export type SleepRecordUpdate = Updateable<"sleep_records">;

export const sleepRecordsAPI = {
  async getAll(userId: string): Promise<SleepRecord[]> {
    const { data, error } = await supabase
      .from("sleep_records")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByDate(userId: string, date: string): Promise<SleepRecord | null> {
    const { data, error } = await supabase
      .from("sleep_records")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Create a new sleep record
  async create(record: SleepRecordInsert): Promise<SleepRecord> {
    const { data, error } = await supabase
      .from("sleep_records")
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: SleepRecordUpdate): Promise<SleepRecord> {
    const { data, error } = await supabase
      .from("sleep_records")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("sleep_records")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
