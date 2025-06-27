import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our sleep records
export interface SleepRecord {
  id: string;
  user_id: string;
  date: string;
  date_unix?: number;
  uid?: string;
  comments?: string;

  // Sleep timing fields
  time_got_into_bed?: string;
  time_tried_to_sleep?: string;
  time_to_fall_asleep_mins?: number;
  times_woke_up_count?: number;
  total_awake_time_mins?: number;
  final_awakening_time?: string;
  time_trying_to_sleep_after_final_awakening_mins?: number;
  time_got_out_of_bed?: string;

  // Sleep quality
  sleep_quality_rating?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// Database functions
export const sleepRecordsAPI = {
  // Sign in as test user (for development only)
  async signInTestUser() {
    const email = import.meta.env.VITE_TEST_USER_EMAIL;
    const password = import.meta.env.VITE_TEST_USER_PASSWORD;

    if (!email || !password) {
      throw new Error("Missing test user credentials in environment variables");
    }

    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },
  // Get all sleep records for a user
  async getAll(userId: string): Promise<SleepRecord[]> {
    const { data, error } = await supabase
      .from("sleep_records")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get a single sleep record
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
  async create(
    record: Omit<SleepRecord, "id" | "created_at" | "updated_at">,
  ): Promise<SleepRecord> {
    const { data, error } = await supabase
      .from("sleep_records")
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing sleep record
  async update(
    id: string,
    updates: Partial<SleepRecord>,
  ): Promise<SleepRecord> {
    const { data, error } = await supabase
      .from("sleep_records")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a sleep record
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("sleep_records")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
