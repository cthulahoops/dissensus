import type { User } from "@supabase/supabase-js";
import { WorkoutDashboard } from "../components/WorkoutDashboard";
import { useWorkoutData } from "../hooks/useWorkoutData";

type WorkoutDashboardPageProps = {
  user: User;
  onScanQR: () => void;
};

export const WorkoutDashboardPage = ({
  user,
  onScanQR,
}: WorkoutDashboardPageProps) => {
  const { workouts, loading, error } = useWorkoutData(user);

  return (
    <WorkoutDashboard
      workouts={workouts}
      loading={loading}
      error={error}
      onScanQR={onScanQR}
    />
  );
};
