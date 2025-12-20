import { getAllPosts } from '@dev-holic/posts';
import { PostList } from '../components/PostList';

export default async function Home() {
  const posts = await getAllPosts(true);
  return <PostList posts={posts} />;
}
