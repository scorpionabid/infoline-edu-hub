
import { useCallback, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface TranslationCache {
  [key: string]: string;
}

let translationCache: TranslationCache = {};

/**
 * Optimized translation hook with caching and performance improvements
 */
export function useOptimizedTranslation() {
  const { t: originalT, language } = useLanguage();

  // Clear cache when language changes
  useMemo(() => {
    translationCache = {};
  }, [language]);

  const t = useCallback((key: string, options?: any): string => {
    const cacheKey = `${language}-${key}-${JSON.stringify(options || {})}`;
    
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    const translated = originalT(key, options);
    translationCache[cacheKey] = translated;
    
    return translated;
  }, [originalT, language]);

  const validateTranslationKey = useCallback((key: string): boolean => {
    const translated = t(key);
    return translated !== key; // If key equals translation, it's likely missing
  }, [t]);

  const getMissingKeys = useCallback((keys: string[]): string[] => {
    return keys.filter(key => !validateTranslationKey(key));
  }, [validateTranslationKey]);

  return {
    t,
    validateTranslationKey,
    getMissingKeys,
    clearCache: () => { translationCache = {}; }
  };
}

export default useOptimizedTranslation;
