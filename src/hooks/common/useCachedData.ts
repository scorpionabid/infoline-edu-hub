
import { useState, useCallback } from 'react';

export function useCachedData<T>(key: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const get = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, [key]);

  const set = useCallback((value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setData(value);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, [key]);

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(null);
    } catch (error) {
      console.error('Failed to remove cached data:', error);
    }
  }, [key]);

  return {
    data: data || get(),
    get,
    set,
    remove,
    // isLoading
  };
}
