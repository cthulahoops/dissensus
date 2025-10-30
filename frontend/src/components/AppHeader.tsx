type AppHeaderProps = {
  children?: React.ReactNode;
};

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="contained-width toolbar">
        <nav className="buttons">{children}</nav>
      </div>
    </header>
  );
}
