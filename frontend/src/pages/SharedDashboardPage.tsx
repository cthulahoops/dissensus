import { useSharedData } from "../hooks/useSharedData";
import type { User } from "@supabase/supabase-js";
import { SleepDashboard } from "../components/SleepDashboard";

type SharedDashboardPageProps = {
  token: string;
  user: User | null;
};

export function SharedDashboardPage({ token, user }: SharedDashboardPageProps) {
  const {
    data: sleepRecords,
    error,
    isPending: loading,
  } = useSharedData(token);

  // For shared dashboards, we don't want the add record functionality
  const handleAddRecord = () => {
    // Do nothing - shared dashboards are read-only
  };

  if (loading) {
    return (
      <div className="App">
        <header className="app-header">
          <div className="user-info">
            <span>Loading shared dashboard...</span>
          </div>
        </header>
        <main>
          <div className="loading">Loading shared sleep data...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="app-header">
          <div className="user-info">
            <span>Shared Dashboard - Access Error</span>
          </div>
        </header>
        <main>
          <section>
            <h2>Access Error</h2>
            <div className="form-error">{error?.message}</div>
            <p>
              If you believe this link should work, please contact the person
              who shared it with you.
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="user-info">
          <span>
            Viewing Shared Dashboard ({sleepRecords.length} sleep records)
          </span>
          {user ? (
            <div>
              <button onClick={() => (window.location.href = "/")}>
                Back to My Dashboard
              </button>
            </div>
          ) : (
            <span
              style={{ fontSize: "0.875rem", color: "var(--color-text-light)" }}
            >
              Not logged in
            </span>
          )}
        </div>
      </header>

      {/* Use the existing SleepDashboard component but without add functionality */}
      <SleepDashboard
        onAddRecord={handleAddRecord}
        sleepRecords={sleepRecords}
        loading={false}
        error={null}
        isSharedView={true}
        sharedViewInfo="You're viewing a shared sleep tracking dashboard. This is read-only access to someone's sleep data."
      />
    </div>
  );
}
