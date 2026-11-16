import { useCallback } from 'react';
declare const fn: (id: string) => void;
export const useGood = (id: string) => useCallback(() => { fn(id); }, [id]);
