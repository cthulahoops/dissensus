type AppHeaderProps = {
  children?: React.ReactNode;
};

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="app-header">
      <nav className="nav-links">{children}</nav>
    </header>
  );
}
