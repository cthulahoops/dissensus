import type { AppView } from "../hooks/useAppRouter";
import type { User } from "@supabase/supabase-js";

type AppHeaderProps = {
  user: User;
  setAppView: (view: AppView) => void;
  handleSignOut: () => void;
};

export function AppHeader({ user, setAppView, handleSignOut }: AppHeaderProps) {
  return (
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
  );
}
