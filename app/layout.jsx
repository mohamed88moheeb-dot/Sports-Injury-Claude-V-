import './globals.css';
import { RecoveryProvider } from './providers/RecoveryContext';
import { AppNav } from '../components/layout/AppNav';

export const metadata = {
  title: 'Injury Recovery',
  description: 'Evidence-driven injury recovery planning and progress tracking.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RecoveryProvider>
          <AppNav />
          {children}
        </RecoveryProvider>
      </body>
    </html>
  );
}
