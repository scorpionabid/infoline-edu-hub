
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
import { getTranslations, preloadTranslations, clearTranslationCache } from '../translations';

// CRITICAL FIX: Azerbaijani dili default və priority
const DEFAULT_LANGUAGE: SupportedLanguage = 'az';
const PRIORITY_LANGUAGE: SupportedLanguage = 'az';

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

// ENHANCED: Nested value getter with robust fallback
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

// ENHANCED: Dual-layer cache with memory priority
const TRANSLATION_CACHE_KEY = 'infoline_translation_cache';
const CACHE_VERSION = '2.0'; // Version bump for cache reset

// Memory cache for instant access
const memoryCache = new Map<SupportedLanguage, LanguageTranslations>();

const saveToCache = (lang: SupportedLanguage, translations: LanguageTranslations) => {
  try {
    // Save to memory first (priority)
    memoryCache.set(lang, translations);
    
    // Then save to localStorage
    const cacheData = {
      version: CACHE_VERSION,
      language: lang,
      translations,
      timestamp: Date.now()
    };
    localStorage.setItem(`${TRANSLATION_CACHE_KEY}_${lang}`, JSON.stringify(cacheData));
    
    console.log(`[TranslationCache] Saved ${lang} to both memory and localStorage`);
  } catch (error) {
    console.warn('Failed to save translations to cache:', error);
  }
};

const loadFromCache = (lang: SupportedLanguage): LanguageTranslations | null => {
  try {
    // Try memory cache first (instant)
    const memoryResult = memoryCache.get(lang);
    if (memoryResult) {
      console.log(`[TranslationCache] Loaded ${lang} from memory cache`);
      return memoryResult;
    }
    
    // Try localStorage
    const cached = localStorage.getItem(`${TRANSLATION_CACHE_KEY}_${lang}`);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    
    // Check cache version and age (24 hours)
    if (cacheData.version !== CACHE_VERSION || 
        Date.now() - cacheData.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`${TRANSLATION_CACHE_KEY}_${lang}`);
      return null;
    }
    
    // Add to memory cache for next time
    memoryCache.set(lang, cacheData.translations);
    console.log(`[TranslationCache] Loaded ${lang} from localStorage and cached in memory`);
    
    return cacheData.translations;
  } catch (error) {
    console.warn('Failed to load translations from cache:', error);
    return null;
  }
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<LanguageTranslations | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // CRITICAL FIX: Race condition önleme
  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    // Aynı dil və hazır state-də early return
    if (lang === language && translations && isReady && !isLoading) {
      console.log(`[TranslationContext] Language ${lang} already loaded and ready`);
      return;
    }
    
    console.log(`[TranslationContext] Changing language to: ${lang}`);
    setIsLoading(true);
    setError(null);
    
    try {
      // Try cache first (both memory and localStorage)
      let loadedTranslations = loadFromCache(lang);
      
      if (!loadedTranslations) {
        console.log(`[TranslationContext] Loading ${lang} from network...`);
        loadedTranslations = await getTranslations(lang);
        saveToCache(lang, loadedTranslations);
      }
      
      // CRITICAL: Update state in correct order
      setTranslations(loadedTranslations);
      setLanguageState(lang);
      localStorage.setItem('preferredLanguage', lang);
      setIsReady(true);
      setIsLoading(false);
      
      console.log(`[TranslationContext] Successfully loaded language: ${lang}`);
    } catch (err) {
      console.error(`[TranslationContext] Failed to load language ${lang}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to load translations'));
      
      // CRITICAL FIX: Priority fallback to Azerbaijani
      if (lang !== PRIORITY_LANGUAGE) {
        console.log(`[TranslationContext] Falling back to priority language: ${PRIORITY_LANGUAGE}`);
        const fallbackTranslations = loadFromCache(PRIORITY_LANGUAGE);
        if (fallbackTranslations) {
          setTranslations(fallbackTranslations);
          setLanguageState(PRIORITY_LANGUAGE);
          setIsReady(true);
        }
      }
      setIsLoading(false);
    }
  }, [language, translations, isReady, isLoading]);

  // ENHANCED: Initialization with Azerbaijani priority
  useEffect(() => {
    const initializeTranslations = async () => {
      console.log('[TranslationContext] Initializing translations...');
      
      // CRITICAL: Always prioritize Azerbaijani
      const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
      const initialLanguage = (savedLanguage && ['az', 'en', 'ru', 'tr'].includes(savedLanguage)) 
        ? savedLanguage 
        : PRIORITY_LANGUAGE;
      
      console.log(`[TranslationContext] Initial language: ${initialLanguage}`);
      
      // Ensure Azerbaijani is loaded first in background
      if (initialLanguage !== PRIORITY_LANGUAGE) {
        // Load Azerbaijani silently in background first
        try {
          let azTranslations = loadFromCache(PRIORITY_LANGUAGE);
          if (!azTranslations) {
            azTranslations = await getTranslations(PRIORITY_LANGUAGE);
            saveToCache(PRIORITY_LANGUAGE, azTranslations);
          }
          console.log('[TranslationContext] Azerbaijani preloaded successfully');
        } catch (error) {
          console.warn('[TranslationContext] Failed to preload Azerbaijani:', error);
        }
      }
      
      // Load the target language
      await changeLanguage(initialLanguage);
      
      // FIXED: Preload other languages properly
      setTimeout(async () => {
        const otherLanguages = (['en', 'ru', 'tr'] as SupportedLanguage[])
          .filter(lang => lang !== initialLanguage && lang !== PRIORITY_LANGUAGE);
        
        for (const lang of otherLanguages) {
          try {
            await preloadTranslations(lang);
            console.log(`Background preload completed for ${lang}`);
          } catch (err) {
            console.warn(`Background preload failed for ${lang}:`, err);
          }
        }
      }, 2000);
    };

    initializeTranslations();
  }, []); // Empty dependency - only run once

  // Type guard check
  const isModuleName = (name: string): name is keyof LanguageTranslations => {
    return translations && name in translations;
  };

  // ENHANCED: Translation function with better fallback
  const t = useCallback(<T extends keyof TranslationModules>(
    key: T | NestedKeyOf<TranslationModules[T]> | string,
    params?: TranslationInterpolationOptions
  ): string => {
    // CRITICAL: Show loading only briefly
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
