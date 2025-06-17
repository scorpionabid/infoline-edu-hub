
import { useTranslation as useBaseTranslation } from '@/contexts/TranslationContext';
import { useCallback } from 'react';
import type { 
  SupportedLanguage, 
  TranslationInterpolationOptions,
  SmartTranslationOptions 
} from '@/types/translation';

export const useSmartTranslation = () => {
  const { t: baseT, language, setLanguage, isLoading, error } = useBaseTranslation();

  // Enhanced safe translation with smart fallback
  const tSafe = useCallback((
    key: string, 
    fallback?: string | null,
    options?: SmartTranslationOptions
  ): string => {
    if (!key) {
      console.warn('[useSmartTranslation] Empty translation key provided');
      return fallback || '';
    }

    try {
      const result = baseT(key, options?.interpolation);
      
      // If translation returned the key itself (not found), use fallback
      if (result === key && fallback) {
        return fallback;
      }
      
      return result;
    } catch (error) {
      if (options?.warnMissing !== false) {
        console.warn(`[useSmartTranslation] Translation error for key: ${key}`, error);
      }
      
      // Return fallback or processed key
      return fallback || key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  }, [baseT]);

  // Context-aware translation
  const tContext = useCallback((key: string, context: Record<string, any>): string => {
    return tSafe(key, undefined, { interpolation: context });
  }, [tSafe]);

  return {
    t: baseT,
    tSafe,
    tContext,
    language,
    setLanguage,
    isLoading,
    error,
    isReady: !isLoading && !error
  };
};
