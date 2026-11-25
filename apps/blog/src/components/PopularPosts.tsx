import Link from 'next/link';
import type { PostMetadata } from '@dev-holic/posts';
import { popularPosts } from '../lib/popularity';

export async function PopularPosts({ posts }: { posts: PostMetadata[] }) {
  const popular = await popularPosts(posts);
  return (
    <aside className="popular">
      <h2>인기 글</h2>
      <p className="period">최근 한 달</p>
      {popular.length ? (
        <ol>
          {popular.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.id}`}>{post.title}</Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty">방문 통계가 쌓이면 이곳에 인기 글이 표시됩니다.</p>
      )}
    </aside>
  );
}
