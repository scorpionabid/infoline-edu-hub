import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState, useCallback } from 'react';
import { 
  SupportedLanguage, 
  LanguageTranslations, 
  TranslationModules, 
  TranslationInterpolationOptions
} from '../types/translation';

// Helper type to extract all possible nested paths in an object
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : Key;
}[keyof ObjectType & (string | number)];
import { getTranslations, preloadTranslations } from '../translations';

// Default language (can be loaded from user preferences or browser settings)
const DEFAULT_LANGUAGE: SupportedLanguage = 'az';

type TranslationContextType = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: <T extends keyof TranslationModules>(
    key: T | NestedKeyOf<TranslationModules[T]> | string, 
    params?: TranslationInterpolationOptions
  ) => string;
  isLoading: boolean;
  error: Error | null;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Helper function to get nested translation value with type safety and fallback
const getNestedValue = <T extends Record<string, any>>(
  obj: T | undefined | null, 
  path: string,
  params?: TranslationInterpolationOptions & { defaultValue?: string }
): string => {
  // If no object is provided, return the default value or the path in brackets
  if (!obj) return params?.defaultValue || `[${path}]`;
  
  // Try to get the nested value
  const result = path.split('.').reduce<any>((current, key) => {
    if (current === undefined || current === null) return undefined;
    return current[key];
  }, obj);

  // If value is not found, return the default value or the last part of the path
  if (result === undefined) {
    // Try to get the last part of the path as a fallback
    const lastPart = path.split('.').pop() || path;
    // Convert camelCase to space-separated words for better readability
    const readableText = lastPart
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return params?.defaultValue || readableText;
  }

  // Handle string interpolation if params are provided
  if (typeof result === 'string') {
    let finalString = result;
    
    // Only process interpolation if we have params
    if (params) {
      finalString = Object.entries(params).reduce(
        (str, [key, value]) => {
          if (key === 'defaultValue') return str; // Skip defaultValue for interpolation
          return str.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        },
        finalString
      );
    }
    
    return finalString;
  }

  // For non-string values, convert to string
  return String(result);
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

  // Type guard to check if a string is a valid module name
  const isModuleName = (name: string): name is keyof LanguageTranslations => {
    return name in translations;
  };

  // Translation function with type safety and module support
  const t = useCallback(<T extends keyof TranslationModules>(
    key: T | NestedKeyOf<TranslationModules[T]> | string,
    params?: TranslationInterpolationOptions
  ): string => {
    if (isLoading) return '...';
    if (error) return `[${String(key)}]`;
    if (!translations) return `[${String(key)}]`;
    
    const keyStr = String(key);
    
    // Handle direct module access (e.g., t('auth'))
    if (keyStr in translations) {
      const module = translations[keyStr as keyof LanguageTranslations];
      return typeof module === 'string' ? module : `[${keyStr}]`;
    }
    
    // Handle nested keys (e.g., t('auth.login.title'))
    const [moduleName, ...path] = keyStr.split('.');
    
    if (!moduleName || !isModuleName(moduleName) || !translations[moduleName]) {
      // Try to find the key in the default language as fallback
      if (language !== DEFAULT_LANGUAGE) {
        console.warn(`Translation not found for key "${keyStr}" in language "${language}"`);
      }
      return `[${keyStr}]`;
    }
    
    const module = translations[moduleName];
    const nestedKey = path.join('.');
    
    // Handle cases where the module might be a string or object
    if (typeof module === 'string') {
      return module;
    }
    
    // Get the nested value with proper type handling
    const value = getNestedValue(module, nestedKey, params);
    
    // If the value is still not found and we're not using the default language,
    // try to get it from the default language as a fallback
    if (value === `[${nestedKey}]` && language !== DEFAULT_LANGUAGE) {
      console.warn(`Using fallback translation for key "${keyStr}" from default language`);
      const defaultValue = getNestedValue(translations, keyStr, params);
      if (defaultValue !== `[${keyStr}]`) {
        return defaultValue;
      }
    }
    
    return value;
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
