
/**
 * LocalStorage keş utiliti
 * @description Tez-tez istifadə olunan məlumatların client tərəfdə keşlənməsi üçün
 */
export type CacheConfig = {
  expiryInMinutes?: number; // Keşin etibarlılıq müddəti
  key?: string; // Xüsusi keş açarı
};

export type CachedData<T> = {
  data: T;
  timestamp: number;
  expiry: number;
};

/**
 * Məlumatları localStorage-da keşləmək
 */
export const setCache = <T>(key: string, data: T, config: CacheConfig = {}): void => {
  try {
    const { expiryInMinutes = 60 } = config;
    const timestamp = Date.now();
    const expiry = timestamp + expiryInMinutes * 60 * 1000;
    
    const cacheObject: CachedData<T> = {
      data,
      timestamp,
      // expiry
    };
    
    localStorage.setItem(`infoline_cache_${key}`, JSON.stringify(cacheObject));
  } catch (error) {
    console.error('Verilənləri keşdə saxlarkan xəta:', error);
  }
};

/**
 * Məlumatları localStorage-dan əldə etmək
 */
export const getCache = <T>(key: string): T | null => {
  try {
    const cachedData = localStorage.getItem(`infoline_cache_${key}`);
    
    if (!cachedData) return null;
    
    const parsedData = JSON.parse(cachedData) as CachedData<T>;
    const currentTime = Date.now();
    
    // Keşin müddəti bitibsə, sil və null qaytar
    if (currentTime > parsedData.expiry) {
      localStorage.removeItem(`infoline_cache_${key}`);
      return null;
    }
    
    return parsedData.data;
  } catch (error) {
    console.error('Keşdən verilənləri əldə edərkən xəta:', error);
    return null;
  }
};

/**
 * Xüsusi bir keşi silmək
 */
export const clearCache = (key: string): void => {
  try {
    localStorage.removeItem(`infoline_cache_${key}`);
  } catch (error) {
    console.error('Keşi silərkən xəta:', error);
  }
};

/**
 * Bütün keşləri silmək
 */
export const clearAllCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('infoline_cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Bütün keşləri silərkən xəta:', error);
  }
};

/**
 * Keşdəki məlumatın əskimə müddətini yoxlayır
 */
export const isCacheValid = (key: string): boolean => {
  try {
    const cachedData = localStorage.getItem(`infoline_cache_${key}`);
    
    if (!cachedData) return false;
    
    const parsedData = JSON.parse(cachedData) as CachedData<unknown>;
    const currentTime = Date.now();
    
    return currentTime <= parsedData.expiry;
  } catch (error) {
    console.error('Keş etibarlılığını yoxlayarkən xəta:', error);
    return false;
  }
};
