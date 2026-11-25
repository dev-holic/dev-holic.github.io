'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import type { PostMetadata } from '@dev-holic/posts';

interface Props {
  posts: PostMetadata[];
  categories: [string, number][];
}

function ArchiveList({
  posts,
  categories,
  tag,
}: Props & { tag: string | null }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const visible = posts
    .filter((post) => !tag || post.tags?.includes(tag))
    .map((post) => {
      const score = query
        ? Number(
            post.tags?.some((t) => t.toLowerCase().includes(query)) ?? false,
          ) *
            100 +
          Number(post.title.toLowerCase().includes(query)) * 50 +
          Number(post.content?.toLowerCase().includes(query) ?? false) * 10
        : 0;
      return { post, score };
    })
    .filter((item) => !query || item.score > 0)
    .sort((a, b) => b.score - a.score);
  const labels = categories.map(([name]) => name);
  if (tag && !labels.includes(tag)) labels.push(tag);

  return (
    <section className="articles">
      <div className="list-heading">
        <h1>{tag ? tag : query ? '검색 결과' : '최근 글'}</h1>
        <input
          type="search"
          aria-label="글 검색"
          placeholder="제목, 태그, 본문 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <nav aria-label="대표 태그" className="categories">
        {[null, ...labels].map((label) => (
          <Link
            key={label ?? ''}
            aria-current={label === tag ? 'page' : undefined}
            href={label ? `/?tag=${encodeURIComponent(label)}` : '/'}
          >
            {label ?? '전체'}
          </Link>
        ))}
      </nav>
      <ul>
        {visible.map(({ post }) => (
          <li key={post.id} className="entry">
            <time dateTime={post.date}>{post.date.replaceAll('-', '. ')}</time>
            <h2>
              <Link href={`/blog/${post.id}`}>{post.title}</Link>
            </h2>
            <p>{post.summary}</p>
            <div className="tags">
              {post.tags?.map((t) => (
                <Link key={t} href={`/?tag=${encodeURIComponent(t)}`}>
                  #{t}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {!visible.length && <p className="empty">조건에 맞는 글이 없습니다.</p>}
    </section>
  );
}

function FilteredList(props: Props) {
  const params = useSearchParams();
  return <ArchiveList {...props} tag={params.get('tag')} />;
}

export function PostList(props: Props) {
  return (
    <Suspense fallback={<ArchiveList {...props} tag={null} />}>
      <FilteredList {...props} />
    </Suspense>
  );
}
