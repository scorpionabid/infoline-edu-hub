
import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Throttle a function call to limit how often it can be called
 * @param fn The function to throttle
 * @param delay The minimum time between function calls
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Custom hook for implementing throttled API calls
 * @param callback The function to throttle
 * @param delay The minimum time between function calls
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const throttledFn = useRef(throttle(callback, delay));
  
  useEffect(() => {
    throttledFn.current = throttle(callback, delay);
  }, [callback, delay]);
  
  return throttledFn.current;
}

/**
 * Batch multiple API calls to reduce request count
 * @param batchSize Number of items to process in one batch
 * @param processBatch Function to process a batch of items
 */
export function useBatchProcessor<T>(batchSize: number = 10, processBatch: (items: T[]) => Promise<void>) {
  const [queue, setQueue] = useState<T[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Process the queue in batches
  const processQueue = useCallback(async () => {
    if (queue.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const batch = queue.slice(0, batchSize);
      await processBatch(batch);
      setQueue(prev => prev.slice(batchSize));
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [queue, isProcessing, batchSize, processBatch]);
  
  // Add items to the queue
  const addToQueue = useCallback((items: T | T[]) => {
    setQueue(prev => [...prev, ...(Array.isArray(items) ? items : [items])]);
  }, []);
  
  // Process queue when items are added
  useEffect(() => {
    if (queue.length > 0 && !isProcessing) {
      processQueue();
    }
  }, [queue, isProcessing, processQueue]);
  
  return { addToQueue, isProcessing, queueLength: queue.length };
}

/**
 * Track and limit concurrent API requests
 */
export class RequestLimiter {
  private static activeRequests = 0;
  private static maxConcurrent = 6;
  private static queue: (() => void)[] = [];
  
  static setMaxConcurrent(max: number) {
    RequestLimiter.maxConcurrent = max;
  }
  
  static async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    if (RequestLimiter.activeRequests >= RequestLimiter.maxConcurrent) {
      // Queue the request
      return new Promise<T>((resolve, reject) => {
        RequestLimiter.queue.push(() => {
          RequestLimiter.executeRequest(requestFn)
            .then(resolve)
            .catch(reject);
        });
      });
    }
    
    // Execute the request
    RequestLimiter.activeRequests++;
    try {
      return await requestFn();
    } finally {
      RequestLimiter.activeRequests--;
      // Process next request in queue
      if (RequestLimiter.queue.length > 0) {
        const nextRequest = RequestLimiter.queue.shift();
        if (nextRequest) nextRequest();
      }
    }
  }
}
