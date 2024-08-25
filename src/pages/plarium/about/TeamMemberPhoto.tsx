import { useContext, useEffect, useRef } from 'react';
import { useDomRectRef } from '../_common/useDomRectRef';
import { ScrollContext } from '../ScrollContext';

export const TeamMemberPhoto = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const domRectRef = useDomRectRef(containerRef);
  const { addListener, removeListener } = useContext(ScrollContext);

  useEffect(() => {
    if (!addListener || !removeListener) {
      return;
    }

    const listener = (scrollTop: number) => {
      const domRect = domRectRef.current;
      const imageWrapper = imageWrapperRef.current;
      if (!domRect || !imageWrapper) {
        return;
      }

      requestAnimationFrame(() => {
        const domHeightHalf = domRect.height / 2;

        const deltaY = scrollTop - domRect.top;

        if (deltaY < 0) {
          imageWrapper.style.opacity = '0';
        } else if (deltaY < domHeightHalf * 1.5) {
          const opacity = Math.min(deltaY / (domHeightHalf / 4), 1);
          imageWrapper.style.opacity = String(opacity);
        } else {
          const opacity = Math.min(1 - (deltaY - domHeightHalf * 1.5) / (domHeightHalf / 2), 1);
          imageWrapper.style.opacity = String(opacity);
        }

        const imgPosition =
          deltaY >= domHeightHalf ? 10 : Math.floor(deltaY / (domHeightHalf / 10));
        Array.from(imageWrapper.children).forEach((img, index) => {
          if (index === 0) {
            return;
          } else if (index === imgPosition) {
            img.classList.remove('opacity-0');
          } else {
            img.classList.add('opacity-0');
          }
        });

        imageWrapper.style.transform = `scale(${2 - Math.min(Math.max(deltaY - domHeightHalf, 0) / (domHeightHalf / 2), 1)})`;
      });
    };

    addListener(listener);

    return () => {
      removeListener(listener);
    };
  }, [addListener, domRectRef, removeListener]);

  return (
    <div ref={containerRef}>
      <div className='min-h-dvh'></div>
      <div className='min-h-dvh'></div>
      <div
        ref={imageWrapperRef}
        className='pointer-events-none fixed left-0 top-0 h-dvh min-h-dvh w-full scale-150 opacity-0'>
        <img
          className='absolute h-full w-full object-cover'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_1.0.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_2_1.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_2_2.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_2_3.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_3_1.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_3_2.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_3_3.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_4_1.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_4_2.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_4_3.webp'
        />
        <img
          className='absolute h-full w-full object-cover opacity-0'
          src='https://cdn-company.plarium.com/meet/production/media/assets/images/team/Team_Image_Vertical_4.0.webp'
        />
      </div>
    </div>
  );
};
