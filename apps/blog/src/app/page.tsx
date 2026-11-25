import { getAllPosts } from '@dev-holic/posts';
import Link from 'next/link';
import { PostList } from '../components/PostList';
import { popularPosts } from '../lib/popularity';

export default async function Home() {
  const posts = await getAllPosts(true);
  const popular = await popularPosts(posts);
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
      <aside className="popular">
        <h2>인기 글</h2>
        <p className="period">최근 한 달 · 방문 수 기준</p>
        {popular.length ? (
          <ol>
            {popular.map((post) => (
              <li key={post.id}>
                <Link href={`/blog/${post.id}`}>{post.title}</Link>
                <small>{post.count.toLocaleString('ko-KR')}회</small>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty">
            방문 통계가 쌓이면 이곳에 인기 글이 표시됩니다.
          </p>
        )}
      </aside>
    </div>
  );
}
