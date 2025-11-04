-- Add workout_type column to workouts table
ALTER TABLE public.workouts ADD COLUMN workout_type TEXT;

-- Set a default value for existing records (if any)
UPDATE public.workouts SET workout_type = 'other' WHERE workout_type IS NULL;
