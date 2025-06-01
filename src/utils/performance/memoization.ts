
import { useMemo, useRef, useCallback } from 'react';

// Deep comparison for objects
export function deepEquals(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEquals(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

// Memoize expensive computations
export function useMemoizedComputation<T>(
  computation: () => T,
  dependencies: any[]
): T {
  return useMemo(computation, dependencies);
}

// Memoize callbacks with deep comparison
export function useDeepMemoCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  const ref = useRef<{ deps: any[]; callback: T }>();

  if (!ref.current || !deepEquals(ref.current.deps, dependencies)) {
    ref.current = {
      deps: dependencies,
      callback,
    };
  }

  return useCallback(ref.current.callback, [ref.current.callback]);
}

// Memoize values with deep comparison
export function useDeepMemo<T>(factory: () => T, dependencies: any[]): T {
  const ref = useRef<{ deps: any[]; value: T }>();

  if (!ref.current || !deepEquals(ref.current.deps, dependencies)) {
    ref.current = {
      deps: dependencies,
      value: factory(),
    };
  }

  return ref.current.value;
}
