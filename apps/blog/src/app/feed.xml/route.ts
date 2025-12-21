import RSS from 'rss';
import { getAllPosts } from '@dev-holic/posts';

export const dynamic = 'force-static';

export async function GET() {
  const allPosts = await getAllPosts(false);
  const baseUrl = 'https://dev-holic.github.io';

  const feed = new RSS({
    title: 'Dev Holic Blog',
    description: 'Dev Holic Blog Posts',
    site_url: baseUrl,
    feed_url: `${baseUrl}/feed.xml`,
    copyright: `${new Date().getFullYear()} Dev Holic`,
    language: 'ko',
    pubDate: new Date(),
  });

  const posts = allPosts.filter((post) => !isNaN(new Date(post.date).getTime()));

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.summary || '',
      url: `${baseUrl}/blog/${post.id}`,
      guid: `${baseUrl}/blog/${post.id}`,
      date: new Date(post.date),
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
