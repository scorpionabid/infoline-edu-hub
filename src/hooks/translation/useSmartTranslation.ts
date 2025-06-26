
import { useTranslation } from '@/contexts/TranslationContext';
import { SmartTranslationOptions } from '@/types/translation';

export const useSmartTranslation = () => {
  const { t: baseT, language, setLanguage, isLoading, error, isReady } = useTranslation();

  const tSafe = (
    key: string, 
    fallback?: string | null, 
    options?: SmartTranslationOptions
  ): string => {
    try {
      const result = baseT(key, options?.interpolation);
      
      if (result === key || result === '...') {
        if (fallback !== null) {
          return fallback || key.split('.').pop() || key;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return fallback || key.split('.').pop() || key;
    }
  };

  const tContext = (key: string, context: Record<string, any>): string => {
    return baseT(key, context);
  };

  return {
    t: baseT,
    tSafe,
    tContext,
    language,
    setLanguage,
    isLoading,
    error,
    // isReady
  };
};
