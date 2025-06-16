import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState, useCallback } from 'react';
import { 
  SupportedLanguage, 
  LanguageTranslations, 
  TranslationModules, 
  TranslationKeyPath,
  TranslationInterpolationOptions 
} from '../types/translation';
import { getTranslations, preloadTranslations } from '../translations';

// Default language (can be loaded from user preferences or browser settings)
const DEFAULT_LANGUAGE: SupportedLanguage = 'az';

type TranslationContextType = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: <T extends keyof TranslationModules>(
    key: T | TranslationKeyPath<TranslationModules[T]>, 
    params?: TranslationInterpolationOptions
  ) => string;
  isLoading: boolean;
  error: Error | null;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Helper function to get nested translation value with type safety
const getNestedValue = <T extends Record<string, any>>(obj: T, path: string): string => {
  return path.split('.').reduce<string>((o, p) => {
    if (o === undefined || o === null) return `[${path}]`;
    return o[p] !== undefined ? o[p] : `[${path}]`;
  }, obj as any);
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<LanguageTranslations | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Change language handler
  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    if (lang === language && translations) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedTranslations = await getTranslations(lang);
      setTranslations(loadedTranslations);
      setLanguageState(lang);
      // Optionally save to localStorage or user preferences
      localStorage.setItem('preferredLanguage', lang);
    } catch (err) {
      console.error('Failed to load translations:', err);
      setError(err instanceof Error ? err : new Error('Failed to load translations'));
    } finally {
      setIsLoading(false);
    }
  }, [language, translations]);

  // Load initial translations
  useEffect(() => {
    // Try to get language from localStorage or use browser language
    const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage || 
                         (navigator.language.split('-')[0] as SupportedLanguage) || 
                         DEFAULT_LANGUAGE;
    
    changeLanguage(savedLanguage);
    
    // Preload other languages in the background
    (['az', 'en', 'ru', 'tr'] as SupportedLanguage[])
      .filter(lang => lang !== savedLanguage)
      .forEach(lang => preloadTranslations(lang));
  }, [changeLanguage]);

  // Translation function with type safety
  const t = useCallback(<T extends keyof TranslationModules>(
    key: T | TranslationKeyPath<TranslationModules[T]>,
    params?: TranslationInterpolationOptions
  ): string => {
    // Return loading/error state if translations aren't ready
    if (isLoading) return '...';
    if (error) return `[${key}]`;
    if (!translations) return `[${key}]`;
    
    const keyStr = String(key);
    const [namespace, ...path] = keyStr.split('.');
    
    try {
      // Type-safe access to the module
      const module = translations[namespace as keyof LanguageTranslations];
      
      if (!module) {
        console.warn(`Translation namespace not found: ${namespace}`);
        return `[${keyStr}]`;
      }
      
      // Get the translation value
      let result = getNestedValue(module, path.join('.'));
      
      // If translation is not found, try to find it in the default language as fallback
      if (result === `[${path.join('.')}]` && language !== DEFAULT_LANGUAGE) {
        // This is a simplified fallback - in a real app, you might want to load the default language
        console.warn(`Translation not found for key "${keyStr}" in language "${language}"`);
      }
      
      // Replace placeholders if params provided
      if (params && typeof result === 'string') {
        result = Object.entries(params).reduce(
          (str, [paramKey, value]) => str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value)),
          result
        );
      }
      
      return result || `[${keyStr}]`;
    } catch (error) {
      console.error(`Translation error for key "${keyStr}":`, error);
      return `[${keyStr}]`;
    }
  }, [translations, isLoading, error, language]);

  const value = useMemo(() => ({
    language,
    setLanguage: changeLanguage,
    t,
    isLoading,
    error,
    changeLanguage,
  }), [language, t, isLoading, error, changeLanguage]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

/**
 * Hook to access the translation context
 * @returns Translation context with t() function and language state
 * @example
 * const { t, language, setLanguage } = useTranslation();
 * <div>{t('auth.login.title')}</div>
 */
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;
