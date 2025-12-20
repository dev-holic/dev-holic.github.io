export interface PostMetadata {
  id: string;
  title: string;
  date: string;
  tags?: string[];
  summary?: string;
  content?: string;
  [key: string]: any;
}

export interface Post {
  metadata: PostMetadata;
  content: string;
}
