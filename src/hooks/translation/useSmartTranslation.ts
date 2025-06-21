
import { useTranslation } from '@/contexts/TranslationContext';

export interface SmartTranslationOptions {
  interpolation?: Record<string, any>;
  fallbackKey?: string;
  defaultValue?: string;
}

export const useSmartTranslation = () => {
  const { t: baseT, language, setLanguage, isLoading, error, isReady } = useTranslation();

  const tSafe = (
    key: string, 
    fallback?: string | null, 
    options?: SmartTranslationOptions
  ): string => {
    try {
      // Use base translation function without interpolation for now
      const result = baseT(key, fallback || undefined);
      
      if (result === key || result === '...') {
        if (fallback !== null) {
          return fallback || options?.defaultValue || key.split('.').pop() || key;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return fallback || options?.defaultValue || key.split('.').pop() || key;
    }
  };

  const tContext = (key: string, context?: Record<string, any>): string => {
    // For now, just use the base translation since our system doesn't support interpolation
    return baseT(key);
  };

  return {
    t: baseT,
    tSafe,
    tContext,
    language,
    setLanguage,
    isLoading,
    error,
    isReady
  };
};
