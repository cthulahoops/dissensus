import { useQueryClient } from "@tanstack/react-query";

import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useAppRouter } from "./hooks/useAppRouter";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { SharedDashboardPage } from "./pages/SharedDashboardPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AddRecordPage } from "./pages/AddRecordPage";
import { ShareManagerPage } from "./pages/ShareManagerPage";
import { WorkoutDashboardPage } from "./pages/WorkoutDashboardPage";
import { ScannerPage } from "./pages/ScannerPage";
import { AppHeader } from "./components/AppHeader";
import { AppFooter } from "./components/AppFooter";
import "./components/Dashboard.css";
import "./components/SleepDashboard.css";

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

  const queryClient = useQueryClient();

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
      return <SharedDashboardPage token={appView.token} user={user} />;
    default:
      if (!user) {
        return (
          <div className="loading">
            <h2>Redirecting to login...</h2>
          </div>
        );
      }

      return (
        <>
          <AppHeader user={user}>
            <button
              onClick={() => {
                window.history.pushState({}, "", "/");
                setAppView({ view: "dashboard" });
              }}
            >
              Sleep Tracker
            </button>
            <button
              onClick={() => {
                window.history.pushState({}, "", "/workouts");
                setAppView({ view: "workout-dashboard" });
              }}
            >
              Workouts
            </button>
          </AppHeader>

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
          {appView.view === "workout-dashboard" && (
            <WorkoutDashboardPage
              user={user}
              onScanQR={() => {
                window.history.pushState({}, "", "/workouts/scan");
                setAppView({ view: "scan-qr" });
              }}
            />
          )}
          {appView.view === "scan-qr" && (
            <ScannerPage
              user={user}
              onBack={() => {
                window.history.pushState({}, "", "/workouts");
                setAppView({ view: "workout-dashboard" });
              }}
            />
          )}

          <AppFooter
            user={user}
            onShare={() => setAppView({ view: "share-manager" })}
            onSignOut={handleSignOut}
          />
        </>
      );
  }
};
