
import { useEffect, useRef, useCallback } from 'react';
import { enhancedCache } from '@/services/cache/EnhancedCacheService';

interface MemoryMonitorOptions {
  cleanupInterval?: number;
  memoryThreshold?: number;
  onMemoryPressure?: () => void;
}

export const useMemoryOptimization = (options: MemoryMonitorOptions = {}) => {
  const {
    cleanupInterval = 60000, // 1 minute
    memoryThreshold = 50 * 1024 * 1024, // 50MB
    onMemoryPressure
  } = options;

  const intervalRef = useRef<NodeJS.Timeout>();
  const lastCleanup = useRef<number>(0);

  /**
   * Check memory usage and trigger cleanup if needed
   */
  const checkMemoryUsage = useCallback(async () => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      
      if (memInfo.usedJSHeapSize > memoryThreshold) {
        console.warn('[MemoryOptimization] High memory usage detected:', {
          used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        });

        // Trigger memory pressure callback
        if (onMemoryPressure) {
          onMemoryPressure();
        }

        // Force cache cleanup
        enhancedCache.cleanup();
        
        // Suggest garbage collection
        if ('gc' in window) {
          (window as any).gc();
        }
      }
    }
  }, [memoryThreshold, onMemoryPressure]);

  /**
   * Perform regular cleanup
   */
  const performCleanup = useCallback(() => {
    const now = Date.now();
    
    // Only cleanup if enough time has passed
    if (now - lastCleanup.current > cleanupInterval) {
      enhancedCache.cleanup();
      lastCleanup.current = now;
      
      console.log('[MemoryOptimization] Performed scheduled cleanup');
    }
  }, [cleanupInterval]);

  /**
   * Handle visibility change for aggressive cleanup
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is hidden, perform aggressive cleanup
      enhancedCache.cleanup();
      console.log('[MemoryOptimization] Performed visibility-based cleanup');
    }
  }, []);

  useEffect(() => {
    // Start memory monitoring
    intervalRef.current = setInterval(() => {
      checkMemoryUsage();
      performCleanup();
    }, cleanupInterval);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on page unload
    const handleBeforeUnload = () => {
      enhancedCache.cleanup();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [checkMemoryUsage, performCleanup, handleVisibilityChange, cleanupInterval]);

  /**
   * Manual memory cleanup
   */
  const forceCleanup = useCallback(() => {
    enhancedCache.cleanup();
    lastCleanup.current = Date.now();
    
    if ('gc' in window) {
      (window as any).gc();
    }
    
    console.log('[MemoryOptimization] Forced cleanup executed');
  }, []);

  /**
   * Get memory statistics
   */
  const getMemoryStats = useCallback(() => {
    const cacheStats = enhancedCache.getStats();
    
    let memoryInfo = null;
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      memoryInfo = {
        used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
        total: Math.round(mem.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024)
      };
    }

    return {
      cache: cacheStats,
      memory: memoryInfo,
      lastCleanup: lastCleanup.current
    };
  }, []);

  return {
    forceCleanup,
    getMemoryStats,
    checkMemoryUsage
  };
};
