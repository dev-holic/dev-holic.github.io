'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function SearchForm({
  live = false,
  query = '',
  tag,
}: {
  live?: boolean;
  query?: string;
  tag?: string | null;
}) {
  return (
    <form action="/" role="search" className="header-search">
      {tag && <input type="hidden" name="tag" value={tag} />}
      <input
        type="search"
        name="q"
        aria-label="글 검색"
        placeholder="제목, 태그, 본문 검색"
        {...(live ? { value: query } : { defaultValue: query })}
        onChange={(event) => {
          if (!live) return;
          const url = new URL(window.location.href);
          const value = event.currentTarget.value;
          if (value) url.searchParams.set('q', value);
          else url.searchParams.delete('q');
          window.history.replaceState(null, '', url);
        }}
      />
    </form>
  );
}

function Search() {
  const pathname = usePathname();
  const params = useSearchParams();
  const live = pathname === '/' || pathname === '/blog';
  return (
    <SearchForm
      key={pathname}
      live={live}
      query={params.get('q') || ''}
      tag={live ? params.get('tag') : null}
    />
  );
}

export function HeaderSearch() {
  return (
    <Suspense fallback={<SearchForm />}>
      <Search />
    </Suspense>
  );
}
