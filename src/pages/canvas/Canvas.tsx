import { useEffect, useRef } from 'react';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      return;
    }

    drawImage(ctx);
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

const drawImage = async (ctx: CanvasRenderingContext2D) => {
  const img = await loadImage('/choonsik.png');
  ctx.drawImage(img, 0, 0);
};

const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};
