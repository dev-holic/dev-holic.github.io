import { createContext } from 'react';

type ContextValue = {
  addListener?: (listener: (scrollTop: number) => void) => void;
  removeListener?: (listener: (scrollTop: number) => void) => void;
};

export const ScrollContext = createContext<ContextValue>({});
