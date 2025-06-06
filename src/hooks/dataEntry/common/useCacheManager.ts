
import { useState, useCallback } from 'react';

export interface CacheStats {
  totalEntries: number;
  lastUpdated: Date | null;
  hitRate: number;
}

export interface UseCacheManagerOptions {
  categoryId: string;
  schoolId: string;
}

export interface UseCacheManagerResult {
  getCacheStats: () => CacheStats;
  clearCache: () => void;
  isCacheValid: (key: string) => boolean;
}

export const useCacheManager = ({ 
  categoryId, 
  schoolId 
}: UseCacheManagerOptions): UseCacheManagerResult => {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalEntries: 0,
    lastUpdated: null,
    hitRate: 0
  });

  const getCacheStats = useCallback(() => {
    return cacheStats;
  }, [cacheStats]);

  const clearCache = useCallback(() => {
    setCacheStats({
      totalEntries: 0,
      lastUpdated: new Date(),
      hitRate: 0
    });
    console.log('Cache cleared for:', { categoryId, schoolId });
  }, [categoryId, schoolId]);

  const isCacheValid = useCallback((key: string) => {
    // Mock cache validation
    return true;
  }, []);

  return {
    getCacheStats,
    clearCache,
    isCacheValid
  };
};

export default useCacheManager;
