'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  tags: string[];
}

function SidebarContent({ tags }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const router = useRouter();
  const pathname = usePathname();

  const handleTagClick = (tag: string | null) => {
    if (tag === null) {
      router.push('/');
    } else {
      router.push(`/?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <>
      {/* Toggle Button (When Sidebar is Closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed md:absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95"
          title="Show tags"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </button>
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          flex-shrink-0 bg-white dark:bg-gray-900 md:bg-transparent
          transition-all duration-300 ease-in-out
          border-l border-gray-200 dark:border-gray-700
          fixed md:relative top-0 right-0 h-full z-40
          ${isOpen 
            ? 'w-64 translate-x-0 opacity-100 shadow-2xl md:shadow-none' 
            : 'w-0 translate-x-full opacity-0 overflow-hidden pointer-events-none'
          }
        `}
      >
        <div className="p-6 md:p-8 h-full flex flex-col min-w-[256px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tags</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1.5 overflow-y-auto pr-2 custom-scrollbar">
            <button
              onClick={() => handleTagClick(null)}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                !selectedTag && pathname === '/'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              All Posts
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(selectedTag === tag ? null : tag)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay (Darken background when sidebar is open) */}
      {isOpen && (
        <div 
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={null}>
      <SidebarContent {...props} />
    </Suspense>
  );
}
