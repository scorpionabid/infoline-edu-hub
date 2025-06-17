
import type { SupportedLanguage, LanguageTranslations } from '@/types/translation';
import { enhancedCache } from './cache/EnhancedCacheService';

const PRIORITY_LANGUAGE: SupportedLanguage = 'az';

/**
 * Translation-specific cache service using EnhancedCacheService
 */
class TranslationCacheService {
  private cachePrefix = 'translations';

  /**
   * Set translations with priority handling
   */
  set(language: SupportedLanguage, translations: LanguageTranslations): void {
    const key = `${this.cachePrefix}_${language}`;
    const isPriority = language === PRIORITY_LANGUAGE;
    
    enhancedCache.set(key, translations, {
      priority: isPriority,
      ttl: isPriority ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000 // 24h for priority, 5min for others
    });
    
    console.log(`[TranslationCache] Cached ${language} (priority: ${isPriority})`);
  }

  /**
   * Get translations with fallback
   */
  get(language: SupportedLanguage): LanguageTranslations | null {
    const key = `${this.cachePrefix}_${language}`;
    const result = enhancedCache.get<LanguageTranslations>(key);
    
    if (result) {
      console.log(`[TranslationCache] Hit for ${language}`);
    } else {
      console.log(`[TranslationCache] Miss for ${language}`);
    }
    
    return result;
  }

  /**
   * Async get with loading deduplication
   */
  async getAsync(language: SupportedLanguage): Promise<LanguageTranslations | null> {
    return Promise.resolve(this.get(language));
  }

  /**
   * Preload priority language
   */
  preloadPriority(): void {
    const azTranslations = this.get(PRIORITY_LANGUAGE);
    if (azTranslations) {
      console.log(`[TranslationCache] Priority language ${PRIORITY_LANGUAGE} already cached`);
    } else {
      console.log(`[TranslationCache] Priority language ${PRIORITY_LANGUAGE} needs loading`);
    }
  }

  /**
   * Delete specific language
   */
  delete(language: SupportedLanguage): void {
    const key = `${this.cachePrefix}_${language}`;
    enhancedCache.delete(key);
    console.log(`[TranslationCache] Deleted ${language}`);
  }

  /**
   * Clear with priority preservation
   */
  clear(preservePriority: boolean = false): void {
    if (preservePriority) {
      // Get priority data before clearing
      const priorityData = this.get(PRIORITY_LANGUAGE);
      
      // Clear all translation cache
      const allLanguages: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];
      allLanguages.forEach(lang => {
        if (lang !== PRIORITY_LANGUAGE) {
          this.delete(lang);
        }
      });
      
      // Restore priority if it existed
      if (priorityData) {
        this.set(PRIORITY_LANGUAGE, priorityData);
      }
    } else {
      // Clear all
      const allLanguages: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];
      allLanguages.forEach(lang => this.delete(lang));
    }
    
    console.log(`[TranslationCache] Cleared (preservePriority: ${preservePriority})`);
  }

  /**
   * Check if language exists in cache
   */
  has(language: SupportedLanguage): boolean {
    return this.get(language) !== null;
  }

  /**
   * Get cache info
   */
  getInfo() {
    const languages: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];
    const cachedLanguages = languages.filter(lang => this.has(lang));
    
    return {
      ...enhancedCache.getStats(),
      languages: cachedLanguages,
      priority: this.has(PRIORITY_LANGUAGE),
      priorityLanguage: PRIORITY_LANGUAGE
    };
  }

  /**
   * Health check for cache integrity
   */
  healthCheck(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check if priority language is available
    if (!this.has(PRIORITY_LANGUAGE)) {
      issues.push(`Priority language ${PRIORITY_LANGUAGE} not cached`);
    }
    
    // Check cache statistics
    const stats = enhancedCache.getStats();
    if (stats.memorySize === 0) {
      issues.push('No cached translations in memory');
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Preload all supported languages
   */
  async preloadAll(
    loaders: Record<SupportedLanguage, () => Promise<LanguageTranslations>>
  ): Promise<void> {
    const cacheLoaders: Record<string, () => Promise<LanguageTranslations>> = {};
    
    Object.entries(loaders).forEach(([lang, loader]) => {
      cacheLoaders[`${this.cachePrefix}_${lang}`] = loader;
    });
    
    await enhancedCache.preloadCritical(cacheLoaders);
  }
}

export const translationCache = new TranslationCacheService();
export default translationCache;
