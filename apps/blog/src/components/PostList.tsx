import Link from 'next/link';
import { PostMetadata } from '@dev-holic/posts';

interface PostListProps {
  posts: PostMetadata[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Blog Posts</h1>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <Link
              href={`/blog/${post.id}`}
              className="text-2xl font-semibold text-blue-600 dark:text-blue-400 hover:underline block mb-2"
            >
              {post.title}
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {post.date}
              {post.tags && post.tags.length > 0 && (
                <span className="ml-2">
                  • {post.tags.map(tag => `#${tag}`).join(' ')}
                </span>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {post.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
