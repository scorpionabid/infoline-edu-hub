
import { useState, useEffect, useRef } from 'react';

/**
 * Memory cache for expensive computations
 */
class MemoryCache {
  private cache = new Map<string, { value: any; timestamp: number; ttl: number }>();
  
  set(key: string, value: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const memoryCache = new MemoryCache();

/**
 * Hook for caching API responses
 */
export const useCachedData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);
  
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      // Check cache first
      const cached = memoryCache.get(key);
      if (cached) {
        setData(cached);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetcher();
        
        if (mounted.current) {
          setData(result);
          memoryCache.set(key, result, ttl);
        }
      } catch (err) {
        if (mounted.current) {
          setError(err as Error);
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [key, fetcher, ttl]); // fetcher əlavə edildi
  
  const refresh = async () => {
    memoryCache.delete(key);
    const result = await fetcher();
    setData(result);
    memoryCache.set(key, result, ttl);
    return result;
  };
  
  return { data, loading, error, refresh };
};
