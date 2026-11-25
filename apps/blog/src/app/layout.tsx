import './globals.scss';
import type { Metadata } from 'next';
import { HeaderSearch } from '../components/HeaderSearch';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL('https://dev-holic.github.io'),
  title: {
    template: '%s | Dev-Holic Blog',
    default: 'Dev-Holic Blog',
  },
  description: 'Dev-Holic Blog - Tech, Development, and more',
  openGraph: {
    title: 'Dev-Holic Blog',
    description: 'Tech, Development, and more',
    url: 'https://dev-holic.github.io',
    siteName: 'Dev-Holic Blog',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dev-Holic Blog',
    description: 'Tech, Development, and more',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dev-Holic Blog',
    url: 'https://dev-holic.github.io',
  };

  return (
    <html lang='ko'>
      <link rel='shortcut icon' href='/favicon.ico' type='image/x-icon' />
      <link rel='icon' href='/favicon.png' type='image/png' />
      <meta name='google-site-verification' content='sXxEHSK4sTx3BrDha-kpJpFaszf3wxeSU5ojx8sqq1A' />

      <body>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="masthead"><div className="wrap">
          <Link href="/" className="wordmark">Dev-Holic<span>.</span></Link>
          <nav aria-label="사이트 메뉴"><HeaderSearch /><a href="/feed.xml">RSS ↗</a></nav>
        </div></header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
