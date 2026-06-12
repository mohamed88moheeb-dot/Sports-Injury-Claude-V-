import { TendonBackground } from '../brand/TendonBackground';

export function PageShell({ children }) {
  return (
    <main className="app-shell">
      <TendonBackground />
      <div className="page-enter">
        {children}
      </div>
    </main>
  );
}
