import './globals.scss';
import type { Metadata } from 'next';
import { getAllPosts } from '@dev-holic/posts';
import { Sidebar } from '../components/Sidebar';

export const metadata: Metadata = {
  title: 'Dev-Holic Blog',
  description: 'Dev-Holic Blog',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const posts = await getAllPosts();
  
  // Extract unique tags
  const tagsSet = new Set<string>();
  posts.forEach(post => {
    post.tags?.forEach(tag => tagsSet.add(tag));
  });
  const tags = Array.from(tagsSet).sort();

  return (
    <html lang='en'>
      <link rel='icon' type='image/svg+xml' href='/vite.svg' />
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col md:flex-row h-screen w-full max-w-7xl mx-auto overflow-hidden relative">
          <main className="flex-1 overflow-y-auto h-full w-full">
            {children}
          </main>
          <Sidebar tags={tags} />
        </div>
      </body>
    </html>
  );
}
