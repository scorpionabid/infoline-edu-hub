
import { useCallback, useEffect, useRef } from 'react';
import { cacheManager } from '@/cache';

interface MemoryStats {
  memory?: {
    used: number;
    total: number;
    percentage: number;
    limit: number;
  };
  performance?: {
    navigation: number;
    loading: number;
  };
}

interface UseMemoryOptimizationOptions {
  onMemoryPressure?: () => void;
  threshold?: number;
}

export const useMemoryOptimization = (options: UseMemoryOptimizationOptions = {}) => {
  const { onMemoryPressure, threshold = 80 } = options;
  const lastCleanup = useRef<number>(0);
  const isMonitoring = useRef<boolean>(false);

  const getMemoryStats = useCallback((): MemoryStats => {
    const stats: MemoryStats = {};

    // Performance memory API (Chrome only)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      stats.memory = {
        used,
        total,
        limit,
        percentage: Math.round((used / limit) * 100)
      };
    }

    // Performance navigation timing
    if (performance.navigation && performance.timing) {
      stats.performance = {
        navigation: performance.navigation.type,
        loading: performance.timing.loadEventEnd - performance.timing.navigationStart
      };
    }

    return stats;
  }, []);

  const checkMemoryUsage = useCallback(() => {
    const stats = getMemoryStats();
    
    if (stats.memory && stats.memory.percentage > threshold) {
      console.warn(`Memory usage high: ${stats.memory.percentage}%`);
      onMemoryPressure?.();
      return true;
    }
    
    return false;
  }, [getMemoryStats, threshold, onMemoryPressure]);

  const forceCleanup = useCallback(() => {
    const now = Date.now();
    
    // Prevent too frequent cleanups
    if (now - lastCleanup.current < 30000) { // 30 seconds
      console.log('Cleanup skipped - too recent');
      return;
    }

    try {
      // Clear cache
      cacheManager.clear();
      
      // Force garbage collection if available (development)
      if (window.gc && typeof window.gc === 'function') {
        window.gc();
      }
      
      lastCleanup.current = now;
      console.log('Memory cleanup completed');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }, []);

  const startMonitoring = useCallback(() => {
    if (isMonitoring.current) return;
    
    isMonitoring.current = true;
    
    const interval = setInterval(() => {
      checkMemoryUsage();
    }, 60000); // Check every minute

    return () => {
      clearInterval(interval);
      isMonitoring.current = false;
    };
  }, [checkMemoryUsage]);

  useEffect(() => {
    // Auto-start monitoring in development
    if (process.env.NODE_ENV === 'development') {
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [startMonitoring]);

  return {
    getMemoryStats,
    checkMemoryUsage,
    forceCleanup,
    startMonitoring
  };
};

declare global {
  interface Window {
    gc?: () => void;
  }
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}
