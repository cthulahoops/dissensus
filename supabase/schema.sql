-- Sleep Tracker Database Schema
-- This creates the main table for storing sleep records

-- Create sleep_records table
CREATE TABLE IF NOT EXISTS sleep_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  date_unix BIGINT,
  uid TEXT,
  complete BOOLEAN DEFAULT false,
  started BOOLEAN DEFAULT false,
  comments TEXT,
  
  -- Sleep timing fields
  time_got_into_bed TIME,
  time_tried_to_sleep TIME,
  time_to_fall_asleep_mins INTEGER,
  times_woke_up_count INTEGER,
  total_awake_time_mins INTEGER,
  final_awakening_time TIME,
  time_in_bed_after_final_awakening_mins INTEGER,
  final_awakening_details JSONB,
  time_got_out_of_bed TIME,
  
  -- Sleep quality and additional data
  sleep_quality_rating TEXT,
  medication_sleep_aids TEXT,
  caffeine_alcohol_1 JSONB,
  caffeine_alcohol_2 JSONB,
  caffeine_alcohol_3 JSONB,
  additional_notes TEXT,
  
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

