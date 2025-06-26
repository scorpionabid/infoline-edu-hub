import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Enhanced debounce hook with cleanup
export const useEnhancedDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized callback hook with dependencies tracking
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);

  // Update callback if dependencies changed
  if (!areEqual(depsRef.current, deps)) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }

  return useCallback(callbackRef.current, deps) as T;
};

// Utility function for deep comparison
const areEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => Object.is(item, b[index]));
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered ${renderCountRef.current} times, last render took ${timeSinceLastRender}, ms`);
    }
  });

  return {
    renderCount: renderCountRef.current,
    logRender: useCallback((extraInfo?: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} render ${renderCountRef.current}${extraInfo ? ` - ${extraInfo}` : ''}`);
      }
    }, [componentName])
  };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  targetRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);
        
        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [targetRef, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
};

// Memory optimization hook
export const useMemoryOptimization = <T>(
  factory: () => T,
  deps: React.DependencyList,
  shouldUpdate?: (prev: T, next: T) => boolean
) => {
  const memoizedValue = useMemo(factory, deps);
  const prevValueRef = useRef<T>(memoizedValue);

  if (shouldUpdate && !shouldUpdate(prevValueRef.current, memoizedValue)) {
    return prevValueRef.current;
  }

  prevValueRef.current = memoizedValue;
  return memoizedValue;
};

// Optimized state updater
export const useOptimizedState = <T>(
  initialValue: T | (() => T),
  compareFn?: (a: T, b: T) => boolean
) => {
  const [state, setState] = useState(initialValue);
  
  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevState)
        : newValue;
      
      // Skip update if values are equal
      if (compareFn ? compareFn(prevState, nextState) : Object.is(prevState, nextState)) {
        return prevState;
      }
      
      return nextState;
    });
  }, [compareFn]);

  return [state, optimizedSetState] as const;
};

// Batch updates hook
export const useBatchedUpdates = () => {
  const updateQueueRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((updateFn: () => void) => {
    updateQueueRef.current.push(updateFn);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const updates = updateQueueRef.current.splice(0);
      updates.forEach(update => update());
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};