export function PageShell({ children }) {
  return (
    <main className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />
      <div className="page-enter">
        {children}
      </div>
    </main>
  );
}
