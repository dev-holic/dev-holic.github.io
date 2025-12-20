import './globals.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dev-Holic Blog',
  description: 'Dev-Holic Blog',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <link rel='icon' type='image/svg+xml' href='/vite.svg' />
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">{children}</body>
    </html>
  );
}
