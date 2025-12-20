import { getAllPosts } from '@dev-holic/posts';
import { PostList } from '../components/PostList';
import { Suspense } from 'react';

export default async function Home() {
  const posts = await getAllPosts(true);
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <PostList posts={posts} />
    </Suspense>
  );
}
