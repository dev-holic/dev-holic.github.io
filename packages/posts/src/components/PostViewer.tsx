'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PostViewerProps {
  content: string;
  postId?: string;
}

export function PostViewer({ content, postId }: PostViewerProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            if (match) {
              const { ref, ...syntaxHighlighterProps } = rest as any;
              return (
                <SyntaxHighlighter
                  {...syntaxHighlighterProps}
                  PreTag="div"
                  children={String(children).replace(/\n$/, '')}
                  language={match[1]}
                  style={vscDarkPlus}
                />
              );
            }
            return (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
          img(props) {
            const { src, alt, ...rest } = props;
            let imageSrc = src;
            
            // Rewrite relative paths if postId is present
            if (postId && src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:')) {
               // Remove leading ./ if present
               const cleanSrc = src.replace(/^\.\//, '');
               imageSrc = `/posts/${postId}/${cleanSrc}`;
            }

            return <img src={imageSrc} alt={alt} {...rest} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
