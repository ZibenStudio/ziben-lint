declare module 'react' {
    export function useEffect(fn: () => void, deps?: unknown[]): void;
    export function useCallback<T>(fn: T, deps: unknown[]): T;
    export function useState<T>(v: T): [T, (v: T) => void];
}
declare module 'server-only';
declare module 'client-only';
declare namespace JSX {
    type Element = object;
    interface IntrinsicElements { [tag: string]: object }
}
