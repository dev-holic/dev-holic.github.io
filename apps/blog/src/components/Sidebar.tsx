'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Virtuoso } from 'react-virtuoso';

interface SidebarProps {
  tags: string[];
}

function SidebarContent({ tags }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const allTags = [null, ...tags];

  return (
    <>
      {/* Toggle Button (When Sidebar is Closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className='fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition-all hover:scale-110 hover:text-blue-600 active:scale-95 md:absolute dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-blue-400'
          title='Show tags'>
          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
            />
          </svg>
        </button>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed right-0 top-0 z-40 h-full flex-shrink-0 border-l border-gray-200 bg-white transition-all duration-300 ease-in-out md:relative md:bg-transparent dark:border-gray-700 dark:bg-gray-900 ${
          isOpen
            ? 'w-64 translate-x-0 opacity-100 shadow-2xl md:shadow-none'
            : 'pointer-events-none w-0 translate-x-full overflow-hidden opacity-0'
        } `}>
        <div className='flex h-full min-w-[256px] flex-col p-6 md:p-8'>
          <div className='mb-8 flex items-center justify-between'>
            <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>Tags</h2>
            <button
              onClick={() => setIsOpen(false)}
              className='-mr-2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              title='Close sidebar'>
              <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <Virtuoso
            style={{ height: '100%' }}
            data={allTags}
            className='custom-scrollbar pr-2'
            itemContent={(index, tag) => {
              if (tag === null) {
                return (
                  <button
                    onClick={() => handleTagClick(null)}
                    className={`mb-1.5 w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                      !selectedTag && pathname === '/'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}>
                    All Posts
                  </button>
                );
              }

              return (
                <button
                  key={tag}
                  onClick={() => handleTagClick(selectedTag === tag ? null : tag)}
                  className={`mb-1.5 w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}>
                  #{tag}
                </button>
              );
            }}
          />
        </div>
      </aside>

      {/* Mobile Overlay (Darken background when sidebar is open) */}
      {isOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden'
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
