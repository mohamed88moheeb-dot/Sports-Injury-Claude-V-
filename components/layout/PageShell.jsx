import { TendonBackground } from '../brand/TendonBackground';

export function PageShell({ children, bare = false }) {
  return (
    <main className={bare ? 'app-shell app-shell--bare' : 'app-shell'}>
      <TendonBackground />
      <div className={bare ? '' : 'page-enter'}>
        {children}
      </div>
    </main>
  );
}
