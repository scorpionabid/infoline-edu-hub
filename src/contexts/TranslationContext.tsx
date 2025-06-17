
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

// Default language is now explicitly Azerbaijani
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
  // If no object is provided, return the default value or a readable fallback
  if (!obj) {
    const fallback = params?.defaultValue || path.split('.').pop() || path;
    return fallback.replace(/([A-Z])/g, ' $1').trim();
  }
  
  // Try to get the nested value
  const result = path.split('.').reduce<any>((current, key) => {
    if (current === undefined || current === null) return undefined;
    return current[key];
  }, obj);

  // If value is not found, return a readable fallback
  if (result === undefined) {
    const lastPart = path.split('.').pop() || path;
    const readableText = lastPart
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return params?.defaultValue || readableText;
  }

  // Handle string interpolation if params are provided
  if (typeof result === 'string') {
    let finalString = result;
    
    if (params) {
      finalString = Object.entries(params).reduce(
        (str, [key, value]) => {
          if (key === 'defaultValue') return str;
          return str.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        },
        finalString
      );
    }
    
    return finalString;
  }

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
      localStorage.setItem('preferredLanguage', lang);
    } catch (err) {
      console.error('Failed to load translations:', err);
      setError(err instanceof Error ? err : new Error('Failed to load translations'));
    } finally {
      setIsLoading(false);
    }
  }, [language, translations]);

  // Load initial translations with priority to Azerbaijani
  useEffect(() => {
    // Priority order: localStorage -> Azerbaijani (default)
    const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
    const initialLanguage = savedLanguage && ['az', 'en', 'ru', 'tr'].includes(savedLanguage) 
      ? savedLanguage 
      : DEFAULT_LANGUAGE;
    
    changeLanguage(initialLanguage);
    
    // Preload other languages in the background
    (['az', 'en', 'ru', 'tr'] as SupportedLanguage[])
      .filter(lang => lang !== initialLanguage)
      .forEach(lang => preloadTranslations(lang));
  }, [changeLanguage]);

  // Type guard to check if a string is a valid module name
  const isModuleName = (name: string): name is keyof LanguageTranslations => {
    return translations && name in translations;
  };

  // Enhanced translation function with better fallback
  const t = useCallback(<T extends keyof TranslationModules>(
    key: T | NestedKeyOf<TranslationModules[T]> | string,
    params?: TranslationInterpolationOptions
  ): string => {
    if (isLoading) return '...';
    if (error) {
      const fallback = String(key).split('.').pop() || String(key);
      return fallback.replace(/([A-Z])/g, ' $1').trim();
    }
    if (!translations) return String(key);
    
    const keyStr = String(key);
    
    // Handle direct module access
    if (keyStr in translations) {
      const module = translations[keyStr as keyof LanguageTranslations];
      return typeof module === 'string' ? module : String(keyStr);
    }
    
    // Handle nested keys
    const [moduleName, ...path] = keyStr.split('.');
    
    if (!moduleName || !isModuleName(moduleName) || !translations[moduleName]) {
      console.warn(`Translation module "${moduleName}" not found for key "${keyStr}"`);
      const fallback = path.length > 0 ? path[path.length - 1] : moduleName;
      return fallback.replace(/([A-Z])/g, ' $1').trim();
    }
    
    const module = translations[moduleName];
    const nestedKey = path.join('.');
    
    if (typeof module === 'string') {
      return module;
    }
    
    return getNestedValue(module, nestedKey, params);
  }, [translations, isLoading, error]);

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

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;
