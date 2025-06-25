import { CacheManager } from '@/cache';

const cacheManager = new CacheManager();

export const cache = {
  get: (key: string) => cacheManager.get(key),
  set: (key: string, value: any, ttl?: number) => cacheManager.set(key, value, ttl),
  delete: (key: string) => cacheManager.delete(key),
  clear: () => cacheManager.clear(),
  // Add missing method
  clearStorage: () => cacheManager.clear()
};

export default cache;

// Performance monitoring
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
