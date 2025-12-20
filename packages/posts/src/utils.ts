import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { Post, PostMetadata } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, 'content');

export async function getAllPosts(): Promise<PostMetadata[]> {
  // Ensure the directory exists
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir);
  const posts: PostMetadata[] = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(fileContent);
      const fileName = file.replace('.md', '');

      return {
        ...data,
        id: fileName,
        title: data.title || fileName,
        date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : (data.date || ''),
        tags: data.tags || [],
        summary: data.summary || '',
      };
    });

  // Sort by date descending
  return posts.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export async function getPostById(id: string): Promise<Post | null> {
  const filePath = path.join(contentDir, `${id}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    metadata: {
      ...data,
      id,
      title: data.title || id,
      date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : (data.date || ''),
      tags: data.tags || [],
      summary: data.summary || '',
    },
    content,
  };
}
