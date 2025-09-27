import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";
import { useAppRouter } from "./hooks/useAppRouter";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { SharedDashboardPage } from "./pages/SharedDashboardPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AddRecordPage } from "./pages/AddRecordPage";
import { ShareManagerPage } from "./pages/ShareManagerPage";
import "./components/SleepDashboard.css";

const queryClient = new QueryClient();

export const Router = () => {
  const { appView, setAppView } = useAppRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (appView.view === "loading") {
      if (user) {
        setAppView({ view: "dashboard" });
      } else {
        setAppView({ view: "login" });
      }
    }
  }, [user, authLoading, appView.view, setAppView]);

  const handleAuthSuccess = () => {
    window.history.replaceState({}, "", "/");
    setAppView({ view: "dashboard" });
  };

  const handleSignOut = () => {
    signOut();
    queryClient.clear();
  };

  if (appView.view === "loading") {
    return (
      <div className="loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  switch (appView.view) {
    case "login":
      return <LoginPage onSuccess={() => setAppView({ view: "dashboard" })} />;
    case "auth-callback":
      return <AuthCallbackPage onSuccess={handleAuthSuccess} />;
    case "shared-dashboard":
      return <SharedDashboardPage token={appView.token} />;
    default:
      if (!user) {
        return (
          <div className="loading">
            <h2>Redirecting to login...</h2>
          </div>
        );
      }

      return (
        <div className="App">
          <header className="app-header">
            <div className="user-info">
              <span>Signed in as: {user.email}</span>
              <div>
                <button onClick={() => setAppView({ view: "share-manager" })}>
                  Share
                </button>
                <button onClick={handleSignOut} className="btn-cancel">
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          <QueryClientProvider client={queryClient}>
            {appView.view === "dashboard" && (
              <DashboardPage
                user={user}
                onAddRecord={() => setAppView({ view: "add-record" })}
              />
            )}
            {appView.view === "add-record" && (
              <AddRecordPage
                user={user}
                onSuccess={() => setAppView({ view: "dashboard" })}
                onCancel={() => setAppView({ view: "dashboard" })}
              />
            )}
            {appView.view === "share-manager" && (
              <ShareManagerPage
                onClose={() => setAppView({ view: "dashboard" })}
              />
            )}
          </QueryClientProvider>
        </div>
      );
  }
};
