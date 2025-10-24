import { useQuery } from "@tanstack/react-query";
import { workoutsAPI } from "../lib/supabase";
import type { Workout } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface WorkoutDataState {
  workouts: Workout[];
  loading: boolean;
  error: string | null;
}

export function useWorkoutData(user: User): WorkoutDataState {
  const {
    data: workouts,
    isPending: loading,
    error,
  } = useQuery<Workout[]>({
    queryKey: ["workouts", user.id],
    queryFn: () => workoutsAPI.getAll(user.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    workouts: workouts ?? [],
    loading: loading,
    error: error?.message || null,
  };
}
