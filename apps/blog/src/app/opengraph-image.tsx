import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export const alt = 'Dev-Holic Blog';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 80,
          background: '#1a202c',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>Dev-Holic</div>
        <div style={{ fontSize: 40, color: '#a0aec0', marginTop: 20 }}>
          Tech Blog
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
