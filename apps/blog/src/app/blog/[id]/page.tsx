import Link from 'next/link';
import { getPostById, getAllPosts, PostViewer } from '@dev-holic/posts';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.metadata.title,
    description: post.metadata.summary,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata.title,
    datePublished: post.metadata.date,
    dateModified: post.metadata.date,
    description: post.metadata.summary,
    author: {
      '@type': 'Person',
      name: 'Dev-Holic', // You might want to make this dynamic if multiple authors exist
    },
    url: `https://dev-holic.github.io/blog/${post.metadata.id}`,
    keywords: post.metadata.tags,
  };

  return (
    <div className='mx-auto p-8'>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
