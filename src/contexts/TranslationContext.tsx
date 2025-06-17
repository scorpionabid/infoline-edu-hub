
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

import { getTranslations } from '../translations';

// CRITICAL FIX: Azərbaycan dili default və priority
const DEFAULT_LANGUAGE: SupportedLanguage = 'az';
const PRIORITY_LANGUAGE: SupportedLanguage = 'az';

// In-memory cache for instant access
const translationMemoryCache = new Map<SupportedLanguage, LanguageTranslations>();

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
  isReady: boolean;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Enhanced nested value getter with robust fallback
const getNestedValue = <T extends Record<string, any>>(
  obj: T | undefined | null, 
  path: string,
  params?: TranslationInterpolationOptions & { defaultValue?: string }
): string => {
  if (!obj) {
    const fallback = params?.defaultValue || path.split('.').pop() || path;
    return fallback.replace(/([A-Z])/g, ' $1').trim();
  }
  
  const result = path.split('.').reduce<any>((current, key) => {
    if (current === undefined || current === null) return undefined;
    return current[key];
  }, obj);

  if (result === undefined) {
    const lastPart = path.split('.').pop() || path;
    const readableText = lastPart
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return params?.defaultValue || readableText;
  }

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
  const [isReady, setIsReady] = useState<boolean>(false);

  // Enhanced changeLanguage with better error handling
  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    // Early return if already loaded
    if (lang === language && translations && isReady) {
      console.log(`[TranslationContext] Language ${lang} already loaded and ready`);
      return;
    }
    
    console.log(`[TranslationContext] Changing language to: ${lang}`);
    setIsLoading(true);
    setError(null);
    
    try {
      // Try memory cache first
      let loadedTranslations = translationMemoryCache.get(lang);
      
      if (!loadedTranslations) {
        console.log(`[TranslationContext] Loading ${lang} from network...`);
        loadedTranslations = await getTranslations(lang);
        translationMemoryCache.set(lang, loadedTranslations);
      }
      
      // Update state in correct order
      setTranslations(loadedTranslations);
      setLanguageState(lang);
      localStorage.setItem('preferredLanguage', lang);
      setIsReady(true);
      console.log(`[TranslationContext] Successfully loaded language: ${lang}`);
    } catch (err) {
      console.error(`[TranslationContext] Failed to load language ${lang}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to load translations'));
      
      // Fallback to Azerbaijani if available
      if (lang !== PRIORITY_LANGUAGE) {
        console.log(`[TranslationContext] Falling back to priority language: ${PRIORITY_LANGUAGE}`);
        const fallbackTranslations = translationMemoryCache.get(PRIORITY_LANGUAGE);
        if (fallbackTranslations) {
          setTranslations(fallbackTranslations);
          setLanguageState(PRIORITY_LANGUAGE);
          setIsReady(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [language, translations, isReady]);

  // Initialize with Azerbaijani translations
  useEffect(() => {
    const initializeTranslations = async () => {
      console.log('[TranslationContext] Initializing translation system...');
      
      const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
      const initialLanguage = (savedLanguage && ['az', 'en', 'ru', 'tr'].includes(savedLanguage)) 
        ? savedLanguage 
        : PRIORITY_LANGUAGE;
      
      await changeLanguage(initialLanguage);
    };

    initializeTranslations();
  }, [changeLanguage]);

  // Type guard check
  const isModuleName = (name: string): name is keyof LanguageTranslations => {
    return translations && name in translations;
  };

  // Enhanced translation function with better fallback
  const t = useCallback(<T extends keyof TranslationModules>(
    key: T | NestedKeyOf<TranslationModules[T]> | string,
    params?: TranslationInterpolationOptions
  ): string => {
    // Show minimal loading indicator
    if (isLoading && !translations) {
      return '...';
    }
    
    // Handle error state gracefully
    if (error && !translations) {
      const fallback = String(key).split('.').pop() || String(key);
      return fallback.replace(/([A-Z])/g, ' $1').trim();
    }
    
    // No translations available
    if (!translations) {
      const fallback = String(key).split('.').pop() || String(key);
      return fallback.replace(/([A-Z])/g, ' $1').trim();
    }
    
    const keyStr = String(key);
    
    // Handle direct module access
    if (keyStr in translations) {
      const module = translations[keyStr as keyof LanguageTranslations];
      return typeof module === 'string' ? module : String(keyStr);
    }
    
    // Handle nested keys
    const [moduleName, ...path] = keyStr.split('.');
    
    if (!moduleName || !isModuleName(moduleName) || !translations[moduleName]) {
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
    isReady,
  }), [language, t, isLoading, error, changeLanguage, isReady]);

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
