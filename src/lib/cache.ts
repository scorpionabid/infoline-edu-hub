/**
 * Vahid keşləmə mexanizmi
 * Bütün tətbiq üçün standartlaşdırılmış keşləmə funksiyaları
 */

// Keş açarları
export const CACHE_KEYS = {
  USER_PROFILE: 'info_line_user_profile',
  USER_SESSION: 'info_line_user_session',
  REGIONS: 'info_line_regions',
  SECTORS: 'info_line_sectors',
  SCHOOLS: 'info_line_schools',
};

// Keş vaxtı (millisaniyə ilə)
export const CACHE_EXPIRY = {
  SHORT: 5 * 60 * 1000, // 5 dəqiqə
  MEDIUM: 30 * 60 * 1000, // 30 dəqiqə
  LONG: 24 * 60 * 60 * 1000, // 1 gün
};

// Keş tipləri
export type CacheStorage = 'local' | 'session';

interface CacheItem<T> {
  data: T;
  expiry: number;
}

/**
 * Keşdən məlumat əldə etmək
 * @param key Keş açarı
 * @param storage Keş saxlama tipi (local/session)
 * @returns Keşlənmiş məlumat və ya null
 */
export function getCache<T>(key: string, storage: CacheStorage = 'local'): T | null {
  try {
    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    const cachedStr = storageObj.getItem(key);
    
    if (!cachedStr) return null;
    
    const cached = JSON.parse(cachedStr) as CacheItem<T>;
    const now = Date.now();
    
    if (cached.expiry && cached.expiry > now) {
      return cached.data;
    }
    
    // Vaxtı keçmiş keşi təmizləyirik
    storageObj.removeItem(key);
    return null;
  } catch (e) {
    console.warn(`Cache reading error for key ${key}:`, e);
    return null;
  }
}

/**
 * Məlumatı keşdə saxlamaq
 * @param key Keş açarı
 * @param data Saxlanılacaq məlumat
 * @param expiryMs Keş vaxtı (millisaniyə ilə)
 * @param storage Keş saxlama tipi (local/session)
 */
export function setCache<T>(
  key: string, 
  data: T | null, 
  expiryMs: number = CACHE_EXPIRY.MEDIUM,
  storage: CacheStorage = 'local'
): void {
  try {
    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    
    if (data === null) {
      storageObj.removeItem(key);
      return;
    }
    
    const expiry = Date.now() + expiryMs;
    storageObj.setItem(
      key,
      JSON.stringify({ data, expiry })
    );
  } catch (e) {
    console.warn(`Cache writing error for key ${key}:`, e);
  }
}

/**
 * Keşi təmizləmək
 * @param key Keş açarı (təyin edilməzsə bütün keşlər təmizlənir)
 * @param storage Keş saxlama tipi (local/session)
 */
export function clearCache(key?: string, storage: CacheStorage = 'local'): void {
  try {
    const storageObj = storage === 'local' ? localStorage : sessionStorage;
    
    if (key) {
      storageObj.removeItem(key);
    } else {
      // Bütün info_line_ prefiksli keşləri təmizləyirik
      Object.keys(storageObj).forEach(k => {
        if (k.startsWith('info_line_')) {
          storageObj.removeItem(k);
        }
      });
    }
  } catch (e) {
    console.warn(`Cache clearing error:`, e);
  }
}
