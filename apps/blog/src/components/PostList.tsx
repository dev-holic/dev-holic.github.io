'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { PostMetadata } from '@dev-holic/posts';
import { Virtuoso } from 'react-virtuoso';

interface PostListProps {
  posts: PostMetadata[];
}

function PostListContent({ posts }: PostListProps) {
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and Sort posts
  const filteredPosts = useMemo(() => {
    let result = posts;

    // 1. Tag Filtering
    if (selectedTag) {
      result = result.filter(post => post.tags?.includes(selectedTag));
    }

    // 2. Search Filtering & Sorting
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      // Calculate scores
      const scoredPosts = result.map(post => {
        let score = 0;
        const titleLower = post.title.toLowerCase();
        const contentLower = post.content?.toLowerCase() || '';
        const tagsLower = post.tags?.map(t => t.toLowerCase()) || [];

        // Priority 1: Tag Match (Highest weight)
        if (tagsLower.some(tag => tag.includes(query))) {
            score += 100;
        }

        // Priority 2: Title Match
        if (titleLower.includes(query)) {
            score += 50;
        }

        // Priority 3: Content Match
        if (contentLower.includes(query)) {
            score += 10;
        }

        return { post, score };
      });

      // Filter out non-matches and sort
      result = scoredPosts
        .filter(item => item.score > 0)
        .sort((a, b) => {
            if (a.score !== b.score) {
                return b.score - a.score; // Higher score first
            }
            // Tie-breaker: Date descending
            return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
        })
        .map(item => item.post);
    }

    return result;
  }, [posts, selectedTag, searchQuery]);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      router.push('/');
    } else {
      router.push(`/?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="h-full">
      <Virtuoso
        style={{ height: '100%' }}
        data={filteredPosts}
        components={{
          Header: () => (
            <div className="p-4 md:p-8 pb-0">
              <div className="flex flex-col gap-6 mb-8">
                  {/* Header & Title */}
                  <div className="flex items-center gap-4">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                          {selectedTag ? `#${selectedTag}` : 'Blog Posts'}
                      </h1>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                      <input
                          type="text"
                          placeholder="Search posts (tags, title, content)..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow text-gray-900 dark:text-gray-100 placeholder-gray-400"
                      />
                      <svg
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                  </div>
              </div>
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  No posts found matching <span className="font-semibold text-gray-900 dark:text-gray-100">"{searchQuery}"</span>
                  {selectedTag && <> with tag <span className="font-semibold text-gray-900 dark:text-gray-100">#{selectedTag}</span></>}
                </div>
              )}
            </div>
          ),
          Footer: () => <div className="h-8" />
        }}
        itemContent={(index, post) => (
          <div className="px-4 md:px-8 pb-8">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
              <Link
                href={`/blog/${post.id}`}
                className="group block"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex flex-wrap items-center gap-3">
                <time>{post.date}</time>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    {post.tags.map(tag => (
                      <button
                        key={tag}
                        onClick={(e) => {
                            e.preventDefault(); 
                            handleTagClick(tag);
                        }}
                        className={`hover:text-blue-500 hover:underline transition-colors ${
                          selectedTag === tag ? 'text-blue-600 font-semibold' : ''
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {post.summary}
              </p>
            </div>
          </div>
        )}
      />
    </div>
  );
}

export function PostList(props: PostListProps) {
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <PostListContent {...props} />
    </Suspense>
  );
}
