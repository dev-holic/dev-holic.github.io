import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = useCanvasSize();
  const [imgInfo, setImgInfo] = useState<{
    img: HTMLImageElement;
    size: { width: number; height: number };
  }>();
  const imgPositionRef = useRef<{ x: number; y: number }>();
  const clickIdRef = useRef<number>();
  const rotationRef = useRef<number>(0);

  const renderCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    const imgPosition = imgPositionRef.current;
    if (!ctx || !imgInfo || !imgPosition) {
      return;
    }
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.save();
    ctx.translate(imgPosition.x, imgPosition.y);
    ctx.rotate(rotationRef.current);
    ctx.drawImage(
      imgInfo.img,
      -imgInfo.size.width / 2,
      -imgInfo.size.height / 2,
      imgInfo.size.width,
      imgInfo.size.height
    );
    ctx.restore();
  }, [canvasSize, imgInfo]);

  useEffect(() => {
    loadImage('/choonsik.png').then((img) => {
      const ratio = img.width / img.height;
      const width = 100;
      const height = width / ratio;
      setImgInfo({ img, size: { width, height } });
      if (!imgPositionRef.current) {
        imgPositionRef.current = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
      }
      renderCanvas();
    });
  }, [canvasSize.height, canvasSize.width, renderCanvas]);

  const onClick = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    const imgPosition = imgPositionRef.current;
    if (!canvas || !imgPosition) {
      return;
    }

    const clickId = Date.now();
    clickIdRef.current = clickId;

    const rect = canvas.getBoundingClientRect();
    const startPosition = { ...imgPosition };
    const endPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const speed = 5;
    const rotationSpeed = 0.1;
    const xDirection = endPosition.x > startPosition.x ? 1 : -1;
    const yDirection = endPosition.y > startPosition.y ? 1 : -1;
    const ratio = Math.abs((endPosition.y - startPosition.y) / (endPosition.x - startPosition.x));
    const xMove = ratio > 1 ? speed / ratio : speed;
    const yMove = ratio > 1 ? speed : speed * ratio;

    const render = () => {
      requestAnimationFrame(() => {
        if (clickIdRef.current !== clickId) {
          return;
        }
        let needRender = false;

        if (xDirection > 0) {
          if (imgPosition.x < endPosition.x) {
            imgPosition.x = Math.min(imgPosition.x + xMove, endPosition.x);
            needRender = true;
          }
        } else {
          if (imgPosition.x > endPosition.x) {
            imgPosition.x = Math.max(imgPosition.x - xMove, endPosition.x);
            needRender = true;
          }
        }

        if (yDirection > 0) {
          if (imgPosition.y < endPosition.y) {
            imgPosition.y = Math.min(imgPosition.y + yMove, endPosition.y);
            needRender = true;
          }
        } else {
          if (imgPosition.y > endPosition.y) {
            imgPosition.y = Math.max(imgPosition.y - yMove, endPosition.y);
            needRender = true;
          }
        }

        if (needRender) {
          rotationRef.current += rotationSpeed;
          renderCanvas();
          render();
        }
      });
    };

    render();
  };

  return (
    <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} onClick={onClick} />
  );
};

const useCanvasSize = () => {
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return canvasSize;
};

const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};
