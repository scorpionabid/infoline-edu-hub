// src/utils/cacheUtils.ts
export interface CacheConfig {
  expiryInMinutes?: number;
}

export const getCache = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(`infoline_cache_${key}`);
    if (!item) return null;
    
    const { data, expiry } = JSON.parse(item);
    
    if (expiry && expiry < Date.now()) {
      localStorage.removeItem(`infoline_cache_${key}`);
      return null;
    }
    
    return data as T;
  } catch (error) {
    console.error('Cache reading error:', error);
    return null;
  }
};

export const setCache = <T>(key: string, data: T, config?: CacheConfig): void => {
  try {
    const expiry = config?.expiryInMinutes 
      ? Date.now() + (config.expiryInMinutes * 60 * 1000) 
      : null;
    
    localStorage.setItem(`infoline_cache_${key}`, JSON.stringify({ data, expiry }));
  } catch (error) {
    console.error('Cache writing error:', error);
  }
};

export const clearCache = (key?: string): void => {
  try {
    if (key) {
      localStorage.removeItem(`infoline_cache_${key}`);
    } else {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith('infoline_cache_')) {
          localStorage.removeItem(k);
        }
      });
    }
  } catch (error) {
    console.error('Cache clearing error:', error);
  }
};