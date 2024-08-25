import { useEffect, useRef } from 'react';
import styles from './Main.module.scss';

export function Main() {
  const textRef = useRef<HTMLHeadingElement>(null);
  const positionRef = useRef(0);
  const staticPositionRef = useRef<{ windowWidth: number; textWidth: number }>();

  useEffect(() => {
    const wheelListener = (e: WheelEvent) => {
      if (!textRef.current) {
        return;
      }
      if (!staticPositionRef.current) {
        staticPositionRef.current = {
          windowWidth: window.innerWidth,
          textWidth: textRef.current.scrollWidth,
        };
      }

      if (
        positionRef.current + e.deltaY >
        staticPositionRef.current.textWidth - staticPositionRef.current.windowWidth
      ) {
        return;
      }

      textRef.current.style.transform = `translateX(-${(positionRef.current += e.deltaY)}px)`;
    };

    window.addEventListener('wheel', wheelListener, { passive: true });

    return () => {
      window.removeEventListener('wheel', wheelListener);
    };
  }, []);

  return (
    <>
      <main className='h-full overflow-hidden bg-black text-white'>
        <div className='h-full'>
          <h1 ref={textRef} className={`${styles.text} flex items-center whitespace-nowrap p-10`}>
            안녕하세요?안녕하세요?안녕하세요?안녕하세요?안녕하세요?안녕하세요?안녕하세요?안녕하세요?안녕하세요?안녕하세요?
          </h1>
        </div>
      </main>
    </>
  );
}
