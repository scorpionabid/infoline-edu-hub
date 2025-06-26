
import { useEffect, useMemo, useCallback } from 'react';
import { cache } from '@/lib/cache';

interface MemoryOptimizationOptions {
  enableGarbageCollection?: boolean;
  memoryThreshold?: number;
  cleanupInterval?: number;
}

export const useMemoryOptimization = (options: MemoryOptimizationOptions = {}) => {
  const {
    enableGarbageCollection = true,
    memoryThreshold = 50, // MB
    cleanupInterval = 30000 // 30 seconds
  } = options;

  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      return {
        used: Math.round(memoryInfo.usedJSHeapSize / 1048576),
        total: Math.round(memoryInfo.totalJSHeapSize / 1048576),
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }, []);

  const cleanupMemory = useCallback(() => {
    try {
      // Clear cache if available
      if (cache && typeof cache.clear === 'function') {
        cache.clear();
      }
      
      // Force garbage collection if available
      if (enableGarbageCollection && 'gc' in window) {
        (window as any).gc();
      }
    } catch (error) {
      console.warn('Memory cleanup failed:', error);
    }
  }, [enableGarbageCollection]);

  const forceCleanup = useCallback(() => {
    cleanupMemory();
  }, [cleanupMemory]);

  const getMemoryStats = useCallback(() => {
    const memoryUsage = getMemoryUsage();
    return {
      memory: memoryUsage
    };
  }, [getMemoryUsage]);

  const memoryInfo = useMemo(() => {
    return getMemoryUsage();
  }, [getMemoryUsage]);

  useEffect(() => {
    if (!enableGarbageCollection) return;

    const interval = setInterval(() => {
      const currentMemory = getMemoryUsage();
      if (currentMemory && currentMemory.used > memoryThreshold) {
        cleanupMemory();
      }
    }, cleanupInterval);

    return () => clearInterval(interval);
  }, [enableGarbageCollection, memoryThreshold, cleanupInterval, getMemoryUsage, cleanupMemory]);

  return {
    memoryInfo,
    cleanupMemory,
    getMemoryUsage,
    forceCleanup,
    // getMemoryStats
  };
};
