
import type { SupportedLanguage, LanguageTranslations } from '@/types/translation';

const CACHE_PREFIX = 'infoline_translations';
const CACHE_VERSION = '1.2';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  version: string;
  language: SupportedLanguage;
  translations: LanguageTranslations;
  timestamp: number;
  checksum?: string;
}

class TranslationCacheService {
  private memoryCache: Map<SupportedLanguage, LanguageTranslations> = new Map();

  // Generate a simple checksum for cache validation
  private generateChecksum(data: LanguageTranslations): string {
    return btoa(JSON.stringify(Object.keys(data).sort())).slice(0, 16);
  }

  // Save to both memory and localStorage
  set(language: SupportedLanguage, translations: LanguageTranslations): void {
    try {
      // Save to memory cache
      this.memoryCache.set(language, translations);

      // Save to localStorage
      const cacheEntry: CacheEntry = {
        version: CACHE_VERSION,
        language,
        translations,
        timestamp: Date.now(),
        checksum: this.generateChecksum(translations)
      };

      localStorage.setItem(
        `${CACHE_PREFIX}_${language}`, 
        JSON.stringify(cacheEntry)
      );
    } catch (error) {
      console.warn(`Failed to cache translations for ${language}:`, error);
    }
  }

  // Get from memory cache first, then localStorage
  get(language: SupportedLanguage): LanguageTranslations | null {
    try {
      // Check memory cache first (fastest)
      const memoryResult = this.memoryCache.get(language);
      if (memoryResult) {
        return memoryResult;
      }

      // Check localStorage
      const cached = localStorage.getItem(`${CACHE_PREFIX}_${language}`);
      if (!cached) return null;

      const cacheEntry: CacheEntry = JSON.parse(cached);

      // Validate cache
      if (
        cacheEntry.version !== CACHE_VERSION ||
        Date.now() - cacheEntry.timestamp > CACHE_EXPIRY ||
        !cacheEntry.translations
      ) {
        this.delete(language);
        return null;
      }

      // Validate checksum if available
      if (cacheEntry.checksum) {
        const currentChecksum = this.generateChecksum(cacheEntry.translations);
        if (currentChecksum !== cacheEntry.checksum) {
          this.delete(language);
          return null;
        }
      }

      // Cache is valid, add to memory and return
      this.memoryCache.set(language, cacheEntry.translations);
      return cacheEntry.translations;
    } catch (error) {
      console.warn(`Failed to retrieve cached translations for ${language}:`, error);
      this.delete(language);
      return null;
    }
  }

  // Delete from both caches
  delete(language: SupportedLanguage): void {
    try {
      this.memoryCache.delete(language);
      localStorage.removeItem(`${CACHE_PREFIX}_${language}`);
    } catch (error) {
      console.warn(`Failed to delete cached translations for ${language}:`, error);
    }
  }

  // Clear all caches
  clear(): void {
    try {
      this.memoryCache.clear();
      
      // Clear localStorage entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear translation cache:', error);
    }
  }

  // Check if translation exists in cache
  has(language: SupportedLanguage): boolean {
    return this.memoryCache.has(language) || 
           localStorage.getItem(`${CACHE_PREFIX}_${language}`) !== null;
  }

  // Get cache info for debugging
  getInfo(): { memory: number; localStorage: number } {
    const memoryCount = this.memoryCache.size;
    const localStorageCount = Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .length;

    return {
      memory: memoryCount,
      localStorage: localStorageCount
    };
  }
}

export const translationCache = new TranslationCacheService();
export default translationCache;
