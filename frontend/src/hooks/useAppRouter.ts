import { useState, useEffect } from "react";
import { isShareUrl, extractTokenFromUrl } from "../lib/shareUtils";

export type AppView =
  | { view: "loading" }
  | { view: "login" }
  | { view: "auth-callback" }
  | { view: "dashboard" }
  | { view: "add-record" }
  | { view: "share-manager" }
  | { view: "shared-dashboard"; token: string }
  | { view: "workout-dashboard" }
  | { view: "scan-qr" };

const getInitialView = (): AppView => {
  const currentPath = window.location.pathname;
  if (currentPath === "/auth/callback") {
    return { view: "auth-callback" };
  }

  if (currentPath === "/workouts") {
    return { view: "workout-dashboard" };
  }

  if (currentPath === "/workouts/scan") {
    return { view: "scan-qr" };
  }

  const isShare = isShareUrl(currentPath);
  if (isShare) {
    const token = extractTokenFromUrl(currentPath);
    if (token) {
      return { view: "shared-dashboard", token };
    }
  }

  return { view: "loading" };
};

export const useAppRouter = () => {
  const [appView, setAppView] = useState<AppView>(getInitialView);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    // This is a simple implementation. A more robust one would
    // re-evaluate the view based on the new path.
    // For now, we'll rely on components calling setAppView directly.
  };

  // This effect could be used to handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setAppView(getInitialView());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return { appView, setAppView, navigate };
};
