
import { useCallback, useRef } from 'react';

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
