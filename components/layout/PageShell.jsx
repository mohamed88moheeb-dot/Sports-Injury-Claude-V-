export function PageShell({ children }) {
  return (
    <main className="app-shell">
      <div className="page-enter">
        {children}
      </div>
    </main>
  );
}
