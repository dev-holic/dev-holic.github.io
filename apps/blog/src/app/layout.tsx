import './globals.scss';
import type { Metadata } from 'next';
import { getAllPosts } from '@dev-holic/posts';
import { Sidebar } from '../components/Sidebar';

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
  const posts = await getAllPosts();

  // Extract unique tags
  const tagsSet = new Set<string>();
  posts.forEach((post) => {
    post.tags?.forEach((tag) => tagsSet.add(tag));
  });
  const tags = Array.from(tagsSet).sort();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dev-Holic Blog',
    url: 'https://dev-holic.github.io',
  };

  return (
    <html lang='en'>
      <link rel='icon' type='image/svg+xml' href='/vite.svg' />
      <meta name='google-site-verification' content='sXxEHSK4sTx3BrDha-kpJpFaszf3wxeSU5ojx8sqq1A' />

      <body className='bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className='relative mx-auto flex h-screen w-full max-w-7xl flex-col overflow-hidden md:flex-row'>
          <main className='h-full w-full flex-1 overflow-y-auto'>{children}</main>
          <Sidebar tags={tags} />
        </div>
      </body>
    </html>
  );
}
