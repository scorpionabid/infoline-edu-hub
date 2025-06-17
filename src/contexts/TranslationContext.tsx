
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

// Enhanced in-memory cache with immediate Azerbaijani fallback
const translationMemoryCache = new Map<SupportedLanguage, LanguageTranslations>();

// Immediate Azerbaijani fallback content
const IMMEDIATE_AZ_FALLBACK = {
  dashboard: {
    title: 'İdarə Paneli',
    loading: 'Yüklənir...',
    error: 'Xəta baş verdi'
  },
  auth: {
    login: 'Daxil ol',
    logout: 'Çıxış'
  },
  navigation: {
    dashboard: 'İdarə Paneli',
    categories: 'Kateqoriyalar',
    schools: 'Məktəblər'
  }
};

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

// Enhanced nested value getter with Azerbaijani fallback
const getNestedValue = <T extends Record<string, any>>(
  obj: T | undefined | null, 
  path: string,
  params?: TranslationInterpolationOptions & { defaultValue?: string }
): string => {
  if (!obj) {
    // Try immediate fallback first
    const fallbackResult = getNestedValue(IMMEDIATE_AZ_FALLBACK as any, path);
    if (fallbackResult !== path) return fallbackResult;
    
    const fallback = params?.defaultValue || path.split('.').pop() || path;
    return fallback.replace(/([A-Z])/g, ' $1').trim();
  }
  
  const result = path.split('.').reduce<any>((current, key) => {
    if (current === undefined || current === null) return undefined;
    return current[key];
  }, obj);

  if (result === undefined) {
    // Try immediate fallback for Azerbaijani
    const fallbackResult = getNestedValue(IMMEDIATE_AZ_FALLBACK as any, path);
    if (fallbackResult !== path) return fallbackResult;
    
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState<boolean>(true); // Start ready with fallback

  // Enhanced changeLanguage with immediate readiness
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
      
      // Maintain readiness with fallback
      if (lang === PRIORITY_LANGUAGE) {
        setLanguageState(PRIORITY_LANGUAGE);
        setIsReady(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [language, translations, isReady]);

  // Initialize with immediate Azerbaijani readiness
  useEffect(() => {
    const initializeTranslations = async () => {
      console.log('[TranslationContext] Initializing translation system...');
      
      const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
      const initialLanguage = (savedLanguage && ['az', 'en', 'ru', 'tr'].includes(savedLanguage)) 
        ? savedLanguage 
        : PRIORITY_LANGUAGE;
      
      // Start ready immediately for Azerbaijani
      if (initialLanguage === 'az') {
        setLanguageState('az');
        setIsReady(true);
      }
      
      await changeLanguage(initialLanguage);
    };

    initializeTranslations();
  }, [changeLanguage]);

  // Type guard check
  const isModuleName = (name: string): name is keyof LanguageTranslations => {
    return translations && name in translations;
  };

  // Enhanced translation function with immediate fallback
  const t = useCallback(<T extends keyof TranslationModules>(
    key: T | NestedKeyOf<TranslationModules[T]> | string,
    params?: TranslationInterpolationOptions
  ): string => {
    const keyStr = String(key);
    
    // Always try fallback first for Azerbaijani
    if (language === 'az' || !translations) {
      const fallbackResult = getNestedValue(IMMEDIATE_AZ_FALLBACK as any, keyStr);
      if (fallbackResult !== keyStr && translations) {
        // If we have both fallback and full translations, prefer full
        const fullResult = getNestedValue(translations, keyStr, params);
        return fullResult !== keyStr ? fullResult : fallbackResult;
      } else if (fallbackResult !== keyStr) {
        return fallbackResult;
      }
    }
    
    // No translations available, use fallback
    if (!translations) {
      const fallback = keyStr.split('.').pop() || keyStr;
      return fallback.replace(/([A-Z])/g, ' $1').trim();
    }
    
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
  }, [translations, language]);

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
