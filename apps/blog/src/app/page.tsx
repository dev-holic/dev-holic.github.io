import { getAllPosts } from '@dev-holic/posts';
import { PopularPosts } from '../components/PopularPosts';
import { PostList } from '../components/PostList';

export default async function Home() {
  const posts = await getAllPosts(true);
  const frequency = new Map<string, number>();
  for (const post of posts) {
    for (const tag of Array.from(new Set(post.tags)))
      frequency.set(tag, (frequency.get(tag) || 0) + 1);
  }
  const categories = Array.from(frequency)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8);
  return (
    <div className="archive">
      <PostList posts={posts} categories={categories} />
      <PopularPosts posts={posts} />
    </div>
  );
}
