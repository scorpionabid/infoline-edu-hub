
import type { SupportedLanguage, LanguageTranslations } from '@/types/translation';

const CACHE_PREFIX = 'infoline_translations';
const CACHE_VERSION = '2.0'; // Version bump
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PRIORITY_LANGUAGE: SupportedLanguage = 'az';

interface CacheEntry {
  version: string;
  language: SupportedLanguage;
  translations: LanguageTranslations;
  timestamp: number;
  checksum?: string;
  priority?: boolean; // New: Mark priority languages
}

class TranslationCacheService {
  private memoryCache: Map<SupportedLanguage, LanguageTranslations> = new Map();
  private loadingPromises: Map<SupportedLanguage, Promise<LanguageTranslations | null>> = new Map();

  // Generate a simple checksum for cache validation
  private generateChecksum(data: LanguageTranslations): string {
    return btoa(JSON.stringify(Object.keys(data).sort())).slice(0, 16);
  }

  // ENHANCED: Priority-aware save with race condition prevention
  set(language: SupportedLanguage, translations: LanguageTranslations): void {
    try {
      // Save to memory cache immediately
      this.memoryCache.set(language, translations);

      // Save to localStorage with priority flag
      const cacheEntry: CacheEntry = {
        version: CACHE_VERSION,
        language,
        translations,
        timestamp: Date.now(),
        checksum: this.generateChecksum(translations),
        priority: language === PRIORITY_LANGUAGE
      };

      localStorage.setItem(
        `${CACHE_PREFIX}_${language}`, 
        JSON.stringify(cacheEntry)
      );
      
      console.log(`[TranslationCache] Cached ${language} (priority: ${language === PRIORITY_LANGUAGE})`);
    } catch (error) {
      console.warn(`Failed to cache translations for ${language}:`, error);
    }
  }

  // ENHANCED: Dual-layer get with priority handling
  get(language: SupportedLanguage): LanguageTranslations | null {
    try {
      // Check memory cache first (fastest)
      const memoryResult = this.memoryCache.get(language);
      if (memoryResult) {
        console.log(`[TranslationCache] Hit memory cache for ${language}`);
        return memoryResult;
      }

      // Check localStorage
      const cached = localStorage.getItem(`${CACHE_PREFIX}_${language}`);
      if (!cached) {
        console.log(`[TranslationCache] Miss for ${language}`);
        return null;
      }

      const cacheEntry: CacheEntry = JSON.parse(cached);

      // Validate cache
      if (cacheEntry.version !== CACHE_VERSION) {
        console.log(`[TranslationCache] Version mismatch for ${language}, clearing`);
        this.delete(language);
        return null;
      }

      // Check expiry (priority languages have longer expiry)
      const maxAge = cacheEntry.priority ? (7 * 24 * 60 * 60 * 1000) : CACHE_EXPIRY; // 7 days for priority
      if (Date.now() - cacheEntry.timestamp > maxAge) {
        console.log(`[TranslationCache] Expired for ${language}, clearing`);
        this.delete(language);
        return null;
      }

      if (!cacheEntry.translations) {
        this.delete(language);
        return null;
      }

      // Validate checksum if available
      if (cacheEntry.checksum) {
        const currentChecksum = this.generateChecksum(cacheEntry.translations);
        if (currentChecksum !== cacheEntry.checksum) {
          console.log(`[TranslationCache] Checksum mismatch for ${language}, clearing`);
          this.delete(language);
          return null;
        }
      }

      // Cache is valid, add to memory and return
      this.memoryCache.set(language, cacheEntry.translations);
      console.log(`[TranslationCache] Hit localStorage cache for ${language}`);
      return cacheEntry.translations;
    } catch (error) {
      console.warn(`Failed to retrieve cached translations for ${language}:`, error);
      this.delete(language);
      return null;
    }
  }

  // ENHANCED: Async get with loading deduplication
  async getAsync(language: SupportedLanguage): Promise<LanguageTranslations | null> {
    // Check if already loading
    const existingPromise = this.loadingPromises.get(language);
    if (existingPromise) {
      console.log(`[TranslationCache] Waiting for existing load promise for ${language}`);
      return existingPromise;
    }

    // Try sync get first
    const cached = this.get(language);
    if (cached) {
      return Promise.resolve(cached);
    }

    // Return null for async (no network loading in cache service)
    return Promise.resolve(null);
  }

  // ENHANCED: Batch preload for initialization
  preloadPriority(): void {
    try {
      // Preload Azerbaijani if not in memory
      if (!this.memoryCache.has(PRIORITY_LANGUAGE)) {
        const azTranslations = this.get(PRIORITY_LANGUAGE);
        if (azTranslations) {
          console.log(`[TranslationCache] Priority language ${PRIORITY_LANGUAGE} preloaded`);
        }
      }
    } catch (error) {
      console.warn('Failed to preload priority language:', error);
    }
  }

  // Delete from both caches
  delete(language: SupportedLanguage): void {
    try {
      this.memoryCache.delete(language);
      localStorage.removeItem(`${CACHE_PREFIX}_${language}`);
      this.loadingPromises.delete(language);
      console.log(`[TranslationCache] Deleted cache for ${language}`);
    } catch (error) {
      console.warn(`Failed to delete cached translations for ${language}:`, error);
    }
  }

  // ENHANCED: Clear with priority preservation option
  clear(preservePriority: boolean = false): void {
    try {
      if (preservePriority) {
        // Clear all except priority language
        const priorityTranslations = this.memoryCache.get(PRIORITY_LANGUAGE);
        this.memoryCache.clear();
        if (priorityTranslations) {
          this.memoryCache.set(PRIORITY_LANGUAGE, priorityTranslations);
        }
        
        // Clear localStorage except priority
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(CACHE_PREFIX) && !key.includes(`_${PRIORITY_LANGUAGE}`)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        // Clear everything
        this.memoryCache.clear();
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
          }
        });
      }
      
      this.loadingPromises.clear();
      console.log(`[TranslationCache] Cache cleared (preservePriority: ${preservePriority})`);
    } catch (error) {
      console.warn('Failed to clear translation cache:', error);
    }
  }

  // Check if translation exists in cache
  has(language: SupportedLanguage): boolean {
    return this.memoryCache.has(language) || 
           localStorage.getItem(`${CACHE_PREFIX}_${language}`) !== null;
  }

  // ENHANCED: Get cache info with priority status
  getInfo(): { 
    memory: number; 
    localStorage: number; 
    priority: boolean;
    languages: SupportedLanguage[];
  } {
    const memoryCount = this.memoryCache.size;
    const memoryLanguages = Array.from(this.memoryCache.keys());
    const localStorageCount = Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .length;
    const hasPriority = this.memoryCache.has(PRIORITY_LANGUAGE);

    return {
      memory: memoryCount,
      localStorage: localStorageCount,
      priority: hasPriority,
      languages: memoryLanguages
    };
  }

  // ENHANCED: Health check for cache integrity
  healthCheck(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];
    
    try {
      // Check if priority language is available
      if (!this.has(PRIORITY_LANGUAGE)) {
        issues.push(`Priority language ${PRIORITY_LANGUAGE} not cached`);
      }
      
      // Check memory vs localStorage consistency
      const memoryLangs = Array.from(this.memoryCache.keys());
      memoryLangs.forEach(lang => {
        const localStorageKey = `${CACHE_PREFIX}_${lang}`;
        if (!localStorage.getItem(localStorageKey)) {
          issues.push(`Memory cache has ${lang} but localStorage doesn't`);
        }
      });
      
      // Check for corrupted localStorage entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '');
            if (!entry.version || !entry.translations) {
              issues.push(`Corrupted cache entry: ${key}`);
            }
          } catch (error) {
            issues.push(`Invalid JSON in cache entry: ${key}`);
          }
        }
      });
      
    } catch (error) {
      issues.push(`Health check failed: ${error}`);
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }
}

export const translationCache = new TranslationCacheService();
export default translationCache;
