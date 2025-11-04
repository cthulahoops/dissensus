-- Sleep Tracker Database Schema
-- This creates the main table for storing sleep records

-- Create sleep_records table
CREATE TABLE IF NOT EXISTS sleep_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase Auth user ID
  date DATE NOT NULL,
  date_unix BIGINT,
  uid TEXT, -- Optional external/legacy identifier (e.g., study participant ID)
  comments TEXT,
  
  -- Sleep timing fields
  time_got_into_bed TIME,
  time_tried_to_sleep TIME,
  time_to_fall_asleep_mins INTEGER,
  times_woke_up_count INTEGER,
  total_awake_time_mins INTEGER,
  final_awakening_time TIME,
  time_trying_to_sleep_after_final_awakening_mins INTEGER,
  time_got_out_of_bed TIME,
  
  -- Sleep quality
  sleep_quality_rating TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_id ON sleep_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_records_date ON sleep_records(date);
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_date ON sleep_records(user_id, date);

-- Enable Row Level Security
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own records
CREATE POLICY "Users can view own sleep records" ON sleep_records
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own records
CREATE POLICY "Users can insert own sleep records" ON sleep_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own records
CREATE POLICY "Users can update own sleep records" ON sleep_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own records
CREATE POLICY "Users can delete own sleep records" ON sleep_records
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sleep_records_updated_at 
    BEFORE UPDATE ON sleep_records 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Sharing functionality
-- Create table for storing share tokens
CREATE TABLE IF NOT EXISTS public_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_shares_token ON public_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_public_shares_expires ON public_shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_public_shares_user_id ON public_shares(user_id);

-- Enable RLS on shares table
ALTER TABLE public_shares ENABLE ROW LEVEL SECURITY;

-- Users can create their own share links
CREATE POLICY "Users can create own shares" ON public_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own share links
CREATE POLICY "Users can view own shares" ON public_shares
  FOR SELECT USING (auth.uid() = user_id);

-- Users can delete their own share links
CREATE POLICY "Users can delete own shares" ON public_shares
  FOR DELETE USING (auth.uid() = user_id);

-- RPC function to set share token for session
CREATE OR REPLACE FUNCTION set_share_token(token text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.share_token', token, true);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Add RLS policy for shared access to sleep records
CREATE POLICY "Allow shared access via token" ON sleep_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public_shares
      WHERE public_shares.share_token = current_setting('app.share_token', true)
      AND public_shares.user_id = sleep_records.user_id
      AND public_shares.expires_at > NOW()
    )
  );

-- Workouts table for Halo Fitness QR code workout tracking
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id TEXT NOT NULL,
  workout_date TIMESTAMPTZ NOT NULL,
  workout_type TEXT,
  duration_seconds INTEGER,
  calories INTEGER,
  distance_km NUMERIC(10, 3),
  avg_speed_kmh NUMERIC(10, 3),
  avg_pace TEXT,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  avg_watts INTEGER,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, workout_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date DESC);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger for workouts
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

