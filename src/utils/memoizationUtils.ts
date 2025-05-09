
import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook that returns the same function reference if dependencies haven't changed
 * Useful for preventing unnecessary re-renders in useEffect and other hooks
 * @param callback Function to memoize
 * @param deps Dependencies to watch for changes
 * @returns Memoized callback function
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T, 
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);
  
  return useCallback(
    (...args: any[]) => callbackRef.current(...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  ) as T;
}

/**
 * Custom hook that compares objects deeply and returns true if they're equal
 * Useful for preventing unnecessary re-renders in useEffect and useMemo
 * @param a First object to compare
 * @param b Second object to compare
 * @returns Boolean indicating if objects are equal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

/**
 * Custom hook that returns the previous value of a given value
 * Useful for comparing previous and current values in render
 * @param value The value to track
 * @returns The previous value (undefined on first render)
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}
