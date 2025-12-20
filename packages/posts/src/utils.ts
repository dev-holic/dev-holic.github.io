import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { Post, PostMetadata } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, 'content');

export async function getAllPosts(includeContent: boolean = false): Promise<PostMetadata[]> {
  // Ensure the directory exists
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const entries = fs.readdirSync(contentDir, { withFileTypes: true });
  const posts: PostMetadata[] = entries
    .map((entry) => {
      let filePath = '';
      let id = '';

      if (entry.isFile() && entry.name.endsWith('.md')) {
        filePath = path.join(contentDir, entry.name);
        id = entry.name.replace('.md', '');
      } else if (entry.isDirectory()) {
        const indexMdPath = path.join(contentDir, entry.name, 'index.md');
        if (fs.existsSync(indexMdPath)) {
          filePath = indexMdPath;
          id = entry.name;
        }
      }

      if (!filePath) return null;

      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        return {
          ...data,
          id,
          title: data.title || id,
          date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : (data.date || ''),
          tags: data.tags || [],
          summary: data.summary || '',
          content: includeContent ? content : undefined,
        };
      } catch (e) {
        console.warn(`Failed to parse post: ${filePath}`, e);
        return null;
      }
    })
    .filter((post): post is PostMetadata => post !== null);

  // Sort by date descending
  return posts.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export async function getPostById(id: string): Promise<Post | null> {
  let filePath = path.join(contentDir, `${id}.md`);
  
  // If file doesn't exist, try folder/index.md
  if (!fs.existsSync(filePath)) {
    filePath = path.join(contentDir, id, 'index.md');
  }

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
