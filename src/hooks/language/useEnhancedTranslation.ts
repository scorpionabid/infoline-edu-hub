
import { useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationUtils, translateWithVars } from '@/utils/translation';
import { Language } from '@/types/language';

export interface UseEnhancedTranslationReturn {
  t: (key: string, variables?: Record<string, string | number>) => string;
  language: string;
  setLanguage: (lang: string) => void;
  hasTranslation: (key: string) => boolean;
  getTranslation: (key: string, targetLang?: Language) => string;
  availableLanguages: string[];
  isRtl: boolean;
}

/**
 * Enhanced translation hook with additional utilities
 */
export const useEnhancedTranslation = (): UseEnhancedTranslationReturn => {
  const { language, setLanguage, availableLanguages, isRtl } = useLanguage();

  /**
   * Enhanced translate function with variable interpolation
   */
  const t = useCallback((
    key: string, 
    variables?: Record<string, string | number>
  ): string => {
    return translateWithVars(key, language as Language, variables);
  }, [language]);

  /**
   * Check if translation exists for current language
   */
  const hasTranslation = useCallback((key: string): boolean => {
    return TranslationUtils.hasTranslation(key, language as Language);
  }, [language]);

  /**
   * Get translation for specific language
   */
  const getTranslation = useCallback((
    key: string, 
    targetLang?: Language
  ): string => {
    return TranslationUtils.getTranslation(
      key, 
      targetLang || (language as Language)
    );
  }, [language]);

  return {
    t,
    language,
    setLanguage,
    hasTranslation,
    getTranslation,
    availableLanguages,
    isRtl
  };
};

export default useEnhancedTranslation;
