import Link from 'next/link';
import { getPostById, getAllPosts, PostViewer } from '@dev-holic/posts';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { counterOrigin } from '@/lib/popularity';
import Comments from '@/components/Comments';

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

  const counter = counterOrigin();
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
    <article className='reading'>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href='/' className='back'>
        ← 글 목록
      </Link>
      <header className='mb-8'>
        <h1 className='reading-title'>
          {post.metadata.title}
        </h1>
        <div className='text-gray-500'>
          {post.metadata.date}
          {post.metadata.tags && (
            <span className='ml-2'>• {post.metadata.tags.map((tag) => `#${tag}`).join(' ')}</span>
          )}
        </div>
      </header>
      <PostViewer content={post.content} postId={post.metadata.id} />
      <Comments />
      {counter && <img src={`${counter}/count?p=${encodeURIComponent('/blog/' + id)}`} width="1" height="1" alt="" />}
    </article>
  );
}
