import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { workoutsAPI } from "../lib/supabase";
import type { Workout, WorkoutInsert } from "../lib/supabase";

export function useAddWorkout(user: User) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workout: WorkoutInsert) => workoutsAPI.create(workout),
    onSuccess: (newWorkout: Workout) => {
      queryClient.setQueryData(
        ["workouts", user.id],
        (old: Workout[] | undefined) =>
          old
            ? sortWorkoutsByDate([...old, newWorkout])
            : [newWorkout],
      );
    },
  });
}

function sortWorkoutsByDate(workouts: Workout[]): Workout[] {
  return workouts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.workout_date).getTime() -
        new Date(a.workout_date).getTime(),
    );
}
