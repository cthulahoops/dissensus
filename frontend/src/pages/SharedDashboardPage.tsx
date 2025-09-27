import { useSharedData } from "../hooks/useSharedData";
import type { User } from "@supabase/supabase-js";
import { SleepDashboard } from "../components/SleepDashboard";
import { AppHeader } from "../components/AppHeader";

type SharedDashboardPageProps = {
  token: string;
  user: User | null;
};

export function SharedDashboardPage({ token, user }: SharedDashboardPageProps) {
  return (
    <>
      <AppHeader user={user}>
        {user && (
          <button onClick={() => (window.location.href = "/")}>
            Back to My Dashboard
          </button>
        )}
      </AppHeader>
      <main>
        <SharedDashboardBody token={token} />
      </main>
    </>
  );
}

function SharedDashboardBody({ token }: { token: string }) {
  const { data: sleepRecords, error, isPending } = useSharedData(token);

  if (isPending) {
    <div className="loading">Loading shared sleep data...</div>;
  }

  if (error) {
    return (
      <section>
        <h2>Access Error</h2>
        <div className="form-error">{error?.message}</div>
        <p>
          If you believe this link should work, please contact the person who
          shared it with you.
        </p>
      </section>
    );
  }

  return (
    <SleepDashboard
      sleepRecords={sleepRecords ?? []}
      loading={false}
      error={null}
      isSharedView={true}
      sharedViewInfo="You're viewing a shared sleep tracking dashboard. This is read-only access to someone's sleep data."
    />
  );
}
