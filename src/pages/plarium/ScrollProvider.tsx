import { PropsWithChildren, RefObject, useCallback, useEffect, useRef } from 'react';
import { ScrollContext } from './ScrollContext';

export const ScrollProvider = ({
  children,
  scrollRef,
}: PropsWithChildren<{ scrollRef: RefObject<HTMLElement> }>) => {
  const listenersRef = useRef<Set<(scrollTop: number) => void>>(new Set());

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.addEventListener('scroll', () => {
      listenersRef.current.forEach((listener) => listener(scrollRef.current!.scrollTop));
    });
  }, [scrollRef]);

  const addListener = useCallback((listener: (scrollTop: number) => void) => {
    listenersRef.current.add(listener);
  }, []);

  const removeListener = useCallback((listener: (scrollTop: number) => void) => {
    listenersRef.current.delete(listener);
  }, []);

  return (
    <ScrollContext.Provider value={{ addListener, removeListener }}>
      {children}
    </ScrollContext.Provider>
  );
};
