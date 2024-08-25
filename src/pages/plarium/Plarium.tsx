import { useRef } from 'react';
import { AboutSection } from './about/AboutSection';
import { MainSection } from './MainSection';
import { ScrollProvider } from './ScrollProvider';
import styles from './Plarium.module.scss';

export const Plarium = () => {
  const scrollRef = useRef<HTMLElement>(null);
  return (
    <main ref={scrollRef} className={`${styles.main} h-full w-full overflow-auto`}>
      <ScrollProvider scrollRef={scrollRef}>
        <MainSection />
        <AboutSection />
      </ScrollProvider>
    </main>
  );
};
