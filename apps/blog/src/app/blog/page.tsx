import { getAllPosts } from '@dev-holic/posts';
import { PostList } from '../../components/PostList';

export default async function BlogPage() {
  const posts = await getAllPosts();
  return <PostList posts={posts} />;
}
