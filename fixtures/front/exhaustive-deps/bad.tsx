import { useCallback } from 'react';
declare const fn: (id: string) => void;
export const useBad = (id: string) => useCallback(() => { fn(id); }, []);
