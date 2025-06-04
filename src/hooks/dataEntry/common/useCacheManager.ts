// Cache management for data entry forms
import { useCallback } from 'react';

interface UseCacheManagerOptions {
  categoryId: string;
  schoolId: string;
  ttl?: number; // Time to live in milliseconds
}

export const useCacheManager = ({ categoryId, schoolId, ttl = 5 * 60 * 1000 }: UseCacheManagerOptions) => {
  
  // Generate cache key
  const getCacheKey = useCallback((key?: string) => {
    const baseKey = `dataEntry_${categoryId}_${schoolId}`;
    return key ? `${baseKey}_${key}` : baseKey;
  }, [categoryId, schoolId]);
  
  // Get data from cache
  const getCachedData = useCallback((key?: string) => {
    try {
      const cacheKey = getCacheKey(key);
      const cachedItem = localStorage.getItem(cacheKey);
      
      if (!cachedItem) return null;
      
      const { data, timestamp } = JSON.parse(cachedItem);
      
      // Check if cache is still valid
      if (Date.now() - timestamp < ttl) {
        return data;
      }
      
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.warn('Cache parsing error:', error);
      return null;
    }
  }, [getCacheKey, ttl]);
  
  // Save data to cache
  const setCachedData = useCallback((data: any, key?: string) => {
    try {
      const cacheKey = getCacheKey(key);
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Cache saving error:', error);
    }
  }, [getCacheKey]);
  
  // Remove specific cache entry
  const removeCachedData = useCallback((key?: string) => {
    try {
      const cacheKey = getCacheKey(key);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Cache removal error:', error);
    }
  }, [getCacheKey]);
  
  // Clear all cache for this category/school
  const clearCache = useCallback(() => {
    try {
      const baseKey = getCacheKey();
      const keysToRemove: string[] = [];
      
      // Find all keys that start with our base key
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(baseKey)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all found keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Cache clearing error:', error);
    }
  }, [getCacheKey]);
  
  // Check if cache exists and is valid
  const isCacheValid = useCallback((key?: string) => {
    try {
      const cacheKey = getCacheKey(key);
      const cachedItem = localStorage.getItem(cacheKey);
      
      if (!cachedItem) return false;
      
      const { timestamp } = JSON.parse(cachedItem);
      return Date.now() - timestamp < ttl;
    } catch (error) {
      return false;
    }
  }, [getCacheKey, ttl]);
  
  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const baseKey = getCacheKey();
    let totalKeys = 0;
    let totalSize = 0;
    let validKeys = 0;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(baseKey)) {
          totalKeys++;
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += item.length;
            
            try {
              const { timestamp } = JSON.parse(item);
              if (Date.now() - timestamp < ttl) {
                validKeys++;
              }
            } catch (e) {
              // Invalid cache entry, should be cleaned up
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error getting cache stats:', error);
    }
    
    return {
      totalKeys,
      validKeys,
      expiredKeys: totalKeys - validKeys,
      totalSizeBytes: totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
    };
  }, [getCacheKey, ttl]);
  
  return {
    getCachedData,
    setCachedData,
    removeCachedData,
    clearCache,
    isCacheValid,
    getCacheStats
  };
};

export default useCacheManager;
