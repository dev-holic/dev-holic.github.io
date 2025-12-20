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
    <div className='mx-auto p-8'>
      <Link href='/' className='mb-4 inline-block text-blue-500 hover:underline'>
        &larr; Back to List
      </Link>
      <header className='mb-8'>
        <h1 className='mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100'>
          {post.metadata.title}
        </h1>
        <div className='text-gray-500 dark:text-gray-400'>
          {post.metadata.date}
          {post.metadata.tags && (
            <span className='ml-2'>• {post.metadata.tags.map((tag) => `#${tag}`).join(' ')}</span>
          )}
        </div>
      </header>
      <PostViewer content={post.content} postId={post.metadata.id} />
    </div>
  );
}
