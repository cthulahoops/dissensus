import type { User } from "@supabase/supabase-js";

type AppFooterProps = {
  user: User | null;
  onShare?: () => void;
  onSignOut?: () => void;
};

export function AppFooter({ user, onShare, onSignOut }: AppFooterProps) {
  return (
    <footer>
      <div className="contained-width toolbar">
        <div>
          {user ? (
            <span>Signed in as: {user.email}</span>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
        <div className="buttons">
          {onShare && <button onClick={onShare}>Share</button>}
          {onSignOut && (
            <button onClick={onSignOut} className="btn-cancel">
              Sign Out
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
