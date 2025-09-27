import type { User } from "@supabase/supabase-js";

type AppHeaderProps = {
  user: User | null;
  children?: React.ReactNode;
};

export function AppHeader({ user, children }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="user-info">
        {user ? (
          <span>Signed in as: {user.email}</span>
        ) : (
          <span>Not signed in</span>
        )}
        <div>{children}</div>
      </div>
    </header>
  );
}
