
interface TranslationCacheEntry {
  data: any;
  timestamp: number;
  language: string;
  version: string;
}

interface TranslationCacheInfo {
  languages: string[];
  priority: boolean;
  size: number;
  version: string;
}

class TranslationCache {
  private cache = new Map<string, TranslationCacheEntry>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly VERSION = '2.0';
  private readonly PRIORITY_LANG = 'az';

  set(language: string, data: any): void {
    const key = this.getKey(language);
    const entry: TranslationCacheEntry = {
      data,
      timestamp: Date.now(),
      language,
      version: this.VERSION
    };

    this.cache.set(key, entry);
    
    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`translation_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to persist translation cache:', error);
    }
  }

  get(language: string): any | null {
    const key = this.getKey(language);
    let entry = this.cache.get(key);

    // If not in memory, try localStorage
    if (!entry) {
      try {
        const stored = localStorage.getItem(`translation_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          if (entry && this.isValid(entry)) {
            this.cache.set(key, entry);
          } else {
            localStorage.removeItem(`translation_${key}`);
            return null;
          }
        }
      } catch (error) {
        console.warn('Failed to load translation from localStorage:', error);
        return null;
      }
    }

    if (!entry || !this.isValid(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private isValid(entry: TranslationCacheEntry): boolean {
    if (!entry.timestamp || !entry.version) return false;
    if (entry.version !== this.VERSION) return false;
    if (Date.now() - entry.timestamp > this.CACHE_TTL) return false;
    return true;
  }

  private getKey(language: string): string {
    return `translations_${language}`;
  }

  clear(): void {
    this.cache.clear();
    
    // Clear from localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('translation_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear translation localStorage:', error);
    }
  }

  getInfo(): TranslationCacheInfo {
    const languages = Array.from(this.cache.keys()).map(key => 
      key.replace('translations_', '')
    );

    return {
      languages,
      priority: languages.includes(this.PRIORITY_LANG),
      size: this.cache.size,
      version: this.VERSION
    };
  }

  preload(language: string): void {
    // Preload from localStorage if available
    const key = this.getKey(language);
    if (!this.cache.has(key)) {
      this.get(language); // This will load from localStorage if available
    }
  }
}

export const translationCache = new TranslationCache();
export default translationCache;
