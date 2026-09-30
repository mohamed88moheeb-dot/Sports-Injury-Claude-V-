import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'ROYO',
  description: 'Criteria-based sports injury rehab: one clear step today, earned progress tomorrow.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B1630' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <Link href="/" className="brand">ROYO</Link>
          <nav>
            <Link href="/today">Today</Link>
            <Link href="/test">Tests</Link>
            <Link href="/body">Body</Link>
          </nav>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
