import type { PostMetadata } from '@dev-holic/posts';

export function counterOrigin() {
  const code = process.env.GOATCOUNTER_CODE;
  if (!code) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(code)) {
    throw new Error('GOATCOUNTER_CODE must be a GoatCounter site code');
  }
  return `https://${code}.goatcounter.com`;
}

export async function popularPosts(posts: PostMetadata[]) {
  const origin = counterOrigin();
  const ranked: { id: string; title: string; count: number }[] = [];
  if (!origin) return ranked;

  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 30);
  const startDate = start.toISOString().slice(0, 10);
  for (const { id, title } of posts) {
    const path = encodeURIComponent(`/blog/${id}`);
    const response = await fetch(`${origin}/counter/${path}.json?start=${startDate}`, {
      cache: 'force-cache',
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 404) continue;
    if (!response.ok)
      throw new Error(`GoatCounter returned ${response.status} for ${id}`);
    const { count } = await response.json();
    if (!/^[\d,\.\s]+$/.test(String(count)))
      throw new Error(`Invalid counter for ${id}`);
    const visits = Number(String(count).replace(/\D/g, ''));
    if (visits > 0) ranked.push({ id, title, count: visits });
  }
  return ranked
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .slice(0, 5);
}
