import { ImageResponse } from 'next/og';
import { getPostById, getAllPosts } from '@dev-holic/posts';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export const alt = 'Blog Post Image';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = await params;
  const post = await getPostById(id);

  const title = post?.metadata.title || 'Dev-Holic Blog';
  const tags = post?.metadata.tags || [];

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: '#1a202c',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            width: '100%',
          }}
        >
          <div style={{ fontSize: 32, color: '#a0aec0', display: 'flex' }}>Dev-Holic Blog</div>
          <div style={{ fontWeight: 'bold', lineHeight: 1.2, display: 'flex' }}>{title}</div>
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    fontSize: 24,
                    background: '#2d3748',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    color: '#e2e8f0',
                    display: 'flex',
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
