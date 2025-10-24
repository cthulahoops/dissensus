import type { User } from "@supabase/supabase-js";
import "./AppFooter.css";

type AppFooterProps = {
  user: User | null;
  onShare?: () => void;
  onSignOut?: () => void;
};

export function AppFooter({ user, onShare, onSignOut }: AppFooterProps) {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="user-info-footer">
          {user ? (
            <span>Signed in as: {user.email}</span>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
        <div className="footer-actions">
          {onShare && (
            <button onClick={onShare} className="btn-footer">
              Share
            </button>
          )}
          {onSignOut && (
            <button onClick={onSignOut} className="btn-footer btn-cancel">
              Sign Out
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
