-- Create workouts table for Halo Fitness QR code workout tracking
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id TEXT NOT NULL, -- Original workout ID from Halo Fitness
    workout_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER,
    calories INTEGER,
    distance_km DECIMAL(10, 3),
    avg_speed_kmh DECIMAL(10, 3),
    avg_pace TEXT,
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    avg_watts INTEGER,
    raw_data JSONB NOT NULL, -- Store the full decoded JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, workout_id) -- Prevent duplicate workout entries
);

-- Enable Row Level Security
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own workouts
CREATE POLICY "Users can view their own workouts"
ON public.workouts
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own workouts
CREATE POLICY "Users can insert their own workouts"
ON public.workouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own workouts
CREATE POLICY "Users can update their own workouts"
ON public.workouts
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own workouts
CREATE POLICY "Users can delete their own workouts"
ON public.workouts
FOR DELETE
USING (auth.uid() = user_id);

-- Create index on user_id and workout_date for faster queries
CREATE INDEX idx_workouts_user_date ON public.workouts(user_id, workout_date DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workouts_updated_at
BEFORE UPDATE ON public.workouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
