import { useContext, useEffect, useRef } from 'react';
import { ScrollContext } from '../ScrollContext';
import { useDomRectRef } from '../_common/useDomRectRef';

export const TeamMemberCount = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const domRectRef = useDomRectRef(containerRef);
  const { addListener, removeListener } = useContext(ScrollContext);
  const isFixed = useRef(false);

  const countRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!addListener || !removeListener) {
      return;
    }

    const listener = (scrollTop: number) => {
      const domRect = domRectRef.current;
      if (!domRect) {
        return;
      }

      requestAnimationFrame(() => {
        if (domRect.top - scrollTop + domRect.height / 2 < window.innerHeight / 2) {
          if (!isFixed.current) {
            isFixed.current = true;
            stickyRef.current!.style.position = 'fixed';
            stickyRef.current!.style.top = '50%';
            stickyRef.current!.style.transform = 'translateY(-50%)';
            animateCountUp(countRef.current!, 1300);
          }
        } else {
          if (isFixed.current) {
            isFixed.current = false;
            stickyRef.current!.style.position = 'static';
            stickyRef.current!.style.top = 'auto';
            stickyRef.current!.style.transform = 'none';
          }
        }

        if (scrollTop - domRect.top > window.innerHeight * 1.5) {
          stickyRef.current!.style.color = '#fff';
        } else {
          stickyRef.current!.style.color = 'rgb(255, 90, 44)';
        }
      });
    };

    addListener(listener);

    return () => {
      removeListener(listener);
    };
  }, [addListener, domRectRef, removeListener]);

  return (
    <div ref={containerRef} className='h-48'>
      <div
        ref={stickyRef}
        className='pointer-events-none h-48 w-full'
        style={{ color: 'rgb(255, 90, 44)' }}>
        <h2 ref={countRef} className='mx-auto w-fit text-9xl font-extrabold'>
          0
        </h2>
        <p className='mx-auto w-fit text-5xl'>professionals</p>
      </div>
    </div>
  );
};

const animateCountUp = (countRef: HTMLHeadingElement, count: number) => {
  const duration = 500;
  const interval = 1000 / 60;
  const step = count / (duration / interval);

  let currentCount = 0;
  const intervalId = setInterval(() => {
    currentCount += step;
    if (currentCount >= count) {
      clearInterval(intervalId);
      currentCount = count;
    }

    countRef.textContent = Math.floor(currentCount).toString();
  }, interval);
};
