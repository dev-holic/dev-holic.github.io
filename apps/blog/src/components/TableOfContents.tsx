'use client';

import { useEffect, useState } from 'react';

export function TableOfContents() {
  const [items, setItems] = useState<
    { id: string; title: string; level: number }[]
  >([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const body = document.getElementById('post-body');
    if (!body) return;
    const headings = Array.from(
      body.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6'),
    ).filter((h) => h.textContent?.trim());
    if (!headings.length) return;
    const entries = headings.map((heading, index) => {
      if (!heading.id) heading.id = `post-section-${index + 1}`;
      return {
        id: heading.id,
        title: heading.textContent!.trim(),
        level: Number(heading.tagName.slice(1)),
      };
    });
    setItems(entries);
    const target = headings.find(
      (h) => '#' + encodeURIComponent(h.id) === location.hash,
    );
    target?.scrollIntoView();
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > 32) break;
        current = heading;
      }
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      )
        current = headings[headings.length - 1];
      setActive(current.id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    const observer = new ResizeObserver(schedule);
    observer.observe(body);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
    };
  }, []);

  if (!items.length) return null;
  const minLevel = Math.min(...items.map((item) => item.level));
  return (
    <nav className="toc" aria-label="목차">
      <h2>목차</h2>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={'#' + encodeURIComponent(item.id)}
              aria-current={active === item.id ? 'location' : undefined}
              style={{
                paddingInlineStart: 10 + Math.min(item.level - minLevel, 3) * 9,
              }}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
