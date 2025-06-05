
import { useState, useCallback } from 'react';

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: Date;
  expiry?: Date;
}

export interface UseDataCacheResult {
  get: (key: string) => any;
  set: (key: string, data: any, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
}

export const useDataCache = (): UseDataCacheResult => {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

  const get = useCallback((key: string) => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (entry.expiry && entry.expiry < new Date()) {
      cache.delete(key);
      return null;
    }
    
    return entry.data;
  }, [cache]);

  const set = useCallback((key: string, data: any, ttl?: number) => {
    const entry: CacheEntry = {
      key,
      data,
      timestamp: new Date(),
      expiry: ttl ? new Date(Date.now() + ttl) : undefined
    };
    
    setCache(prev => new Map(prev.set(key, entry)));
  }, []);

  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  const has = useCallback((key: string) => {
    return cache.has(key);
  }, [cache]);

  return {
    get,
    set,
    remove,
    clear,
    has
  };
};

export default useDataCache;
