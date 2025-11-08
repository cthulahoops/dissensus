-- Add workout_type column to workouts table
ALTER TABLE public.workouts ADD COLUMN workout_type TEXT NOT NULL DEFAULT 'run';

-- Backfill existing records as 'run' (Halo imports are running workouts)
UPDATE public.workouts SET workout_type = 'run' WHERE workout_type IS NULL;

-- Remove the default now that existing records are backfilled
ALTER TABLE public.workouts ALTER COLUMN workout_type DROP DEFAULT;
