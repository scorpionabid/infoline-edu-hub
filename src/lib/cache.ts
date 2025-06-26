
import { cacheManager } from '@/cache';

export const cache = {
  get: (key: string) => cacheManager.get(key),
  set: (key: string, value: any, ttl?: number) => {
    // Convert simple TTL number to proper options object
    const options = typeof ttl === 'number' ? { ttl } : ttl;
    return cacheManager.set(key, value, options);
  },
  delete: (key: string) => cacheManager.delete(key),
  clear: () => cacheManager.clear(),
  clearStorage: () => cacheManager.clear()
};

export default cache;

// Performance monitoring with simple localStorage implementation
export const performanceCache = {
  get: (key: string) => {
    try {
      const cached = localStorage.getItem(`perf_${key}`);
      return cached ? parseInt(cached, 10) : null;
    } catch (error) {
      console.error("Error getting performance cache:", error);
      return null;
    }
  },
  set: (key: string, value: number) => {
    try {
      localStorage.setItem(`perf_${key}`, value.toString());
    } catch (error) {
      console.error("Error setting performance cache:", error);
    }
  },
  delete: (key: string) => {
    try {
      localStorage.removeItem(`perf_${key}`);
    } catch (error) {
      console.error("Error deleting performance cache:", error);
    }
  },
  clear: () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('perf_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing performance cache:", error);
    }
  }
};
