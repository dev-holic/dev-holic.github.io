import { RefObject, useEffect, useRef } from 'react';

export const useDomRectRef = (domRef: RefObject<HTMLElement>) => {
  const domRectRef = useRef<DOMRect>();

  useEffect(() => {
    const dom = domRef.current;
    if (!dom) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      domRectRef.current = dom.getBoundingClientRect();
    });
    resizeObserver.observe(dom);

    return () => {
      resizeObserver.disconnect();
    };
  }, [domRef]);

  return domRectRef;
};
