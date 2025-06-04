import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Debounce function that delays execution until after a specified time
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function that limits execution to once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  
  return (...args: Parameters<T>) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * React hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React hook for debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay),
    [delay]
  );
}

/**
 * Enhanced debounce hook with immediate execution option
 */
export const useAdvancedDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  immediate?: boolean
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  callbackRef.current = callback;
  
  return useCallback(
    (...args: Parameters<T>) => {
      const executeCallback = () => callbackRef.current(...args);
      
      if (immediate && !timeoutRef.current) {
        executeCallback();
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = undefined;
        if (!immediate) {
          executeCallback();
        }
      }, delay);
    },
    [delay, immediate]
  );
};

/**
 * Throttle function with leading and trailing options
 */
export const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
) => {
  const { leading = true, trailing = true } = options;
  const lastCallTime = useRef<number>(0);
  const lastInvokeTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime.current;
      
      lastCallTime.current = now;
      
      const invokeCallback = () => {
        lastInvokeTime.current = now;
        callbackRef.current(...args);
      };
      
      if (lastInvokeTime.current === 0 && leading) {
        invokeCallback();
        return;
      }
      
      if (timeSinceLastCall >= delay) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
        invokeCallback();
      } else if (!timeoutRef.current && trailing) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = undefined;
          invokeCallback();
        }, delay - timeSinceLastCall);
      }
    },
    [delay, leading, trailing]
  );
};
