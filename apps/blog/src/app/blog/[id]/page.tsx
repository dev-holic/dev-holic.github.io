import Link from 'next/link';
import { getPostById, getAllPosts, PostViewer } from '@dev-holic/posts';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to List</Link>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">{post.metadata.title}</h1>
        <div className="text-gray-500 dark:text-gray-400">
          {post.metadata.date}
          {post.metadata.tags && (
            <span className="ml-2">
              • {post.metadata.tags.map(tag => `#${tag}`).join(' ')}
            </span>
          )}
        </div>
      </header>
      <PostViewer content={post.content} />
    </div>
  );
}
