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

// Comprehensive Azerbaijani fallback content
const COMPREHENSIVE_AZ_FALLBACK = {
  dashboard: {
    title: 'İdarə Paneli',
    welcome: 'İdarə Panelinə Xoş Gəlmisiniz',
    loading: 'Yüklənir...',
    error: 'Xəta baş verdi',
    overview: 'Ümumi Baxış',
    quickActions: 'Sürətli Əməliyyatlar',
    recentActivity: 'Son Fəaliyyətlər',
    notifications: 'Bildirişlər',
    home: 'Ana Səhifə',
    profile: 'Profil',
    settings: 'Ayarlar',
    logout: 'Çıxış'
  },
  auth: {
    login: 'Daxil ol',
    logout: 'Çıxış',
    email: 'E-poçt',
    password: 'Şifrə',
    register: 'Qeydiyyat',
    forgot_password: 'Şifrəni unutdum'
  },
  navigation: {
    dashboard: 'İdarə Paneli',
    categories: 'Kateqoriyalar',
    schools: 'Məktəblər',
    regions: 'Bölgələr',
    sectors: 'Sektorlar',
    reports: 'Hesabatlar',
    users: 'İstifadəçilər',
    settings: 'Ayarlar'
  },
  general: {
    save: 'Saxla',
    cancel: 'Ləğv et',
    delete: 'Sil',
    edit: 'Redaktə et',
    add: 'Əlavə et',
    search: 'Axtarış',
    loading: 'Yüklənir...',
    error: 'Xəta',
    success: 'Uğurlu'
  },
  ui: {
    search: 'Axtarış...',
    no_data: 'Məlumat yoxdur',
    loading: 'Yüklənir...',
    error: 'Xəta baş verdi'
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

// Enhanced nested value getter with comprehensive fallback
const getNestedValue = <T extends Record<string, any>>(
  obj: T | undefined | null, 
  path: string,
  params?: TranslationInterpolationOptions & { defaultValue?: string },
  visited = new Set<string>()
): string => {
  // Prevent infinite recursion
  if (visited.has(path)) {
    return path.split('.').pop() || path;
  }
  visited.add(path);

  if (!obj) {
    // Try comprehensive fallback first
    const fallbackValue = getNestedValue(COMPREHENSIVE_AZ_FALLBACK as any, path, params, visited);
    if (fallbackValue !== path) {
      return fallbackValue;
    }
    
    const fallback = params?.defaultValue || path.split('.').pop() || path;
    return fallback.replace(/([A-Z])/g, ' $1').trim();
  }
  
  const result = path.split('.').reduce<any>((current, key) => {
    if (current === undefined || current === null) return undefined;
    return current[key];
  }, obj);

  if (result === undefined) {
    // Try comprehensive fallback for specific nested paths
    const fallbackValue = getNestedValue(COMPREHENSIVE_AZ_FALLBACK as any, path, params, visited);
    if (fallbackValue !== path) {
      return fallbackValue;
    }
    
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
  const [isReady, setIsReady] = useState<boolean>(true); // Always ready with fallback

  // Enhanced changeLanguage with better error handling
  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    console.log(`[TranslationContext] Changing language to: ${lang}`);
    
    // If already the same language and we have translations, skip
    if (lang === language && translations && isReady) {
      console.log(`[TranslationContext] Language ${lang} already loaded`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try memory cache first
      let loadedTranslations = translationMemoryCache.get(lang);
      
      if (!loadedTranslations) {
        console.log(`[TranslationContext] Loading ${lang} from network...`);
        loadedTranslations = await getTranslations(lang);
        translationMemoryCache.set(lang, loadedTranslations);
        console.log(`[TranslationContext] Successfully loaded and cached ${lang}`);
      } else {
        console.log(`[TranslationContext] Using cached ${lang}`);
      }
      
      setTranslations(loadedTranslations);
      setLanguageState(lang);
      localStorage.setItem('preferredLanguage', lang);
      setIsReady(true);
      
    } catch (err) {
      console.error(`[TranslationContext] Failed to load language ${lang}:`, err);
      setError(err instanceof Error ? err : new Error('Translation load failed'));
      
      // Keep system ready with fallback
      setLanguageState(lang);
      setIsReady(true);
    } finally {
      setIsLoading(false);
    }
  }, [language, translations, isReady]);

  // Initialize with saved language or default
  useEffect(() => {
    const initializeTranslations = async () => {
      console.log('[TranslationContext] Initializing...');
      
      const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
      const initialLanguage = (savedLanguage && ['az', 'en', 'ru', 'tr'].includes(savedLanguage)) 
        ? savedLanguage 
        : PRIORITY_LANGUAGE;
      
      setLanguageState(initialLanguage);
      setIsReady(true); // Always ready
      
      // Load translations in background
      try {
        await changeLanguage(initialLanguage);
      } catch (error) {
        console.warn('[TranslationContext] Background loading failed, using fallback');
      }
    };

    initializeTranslations();
  }, []);

  // Type guard check
  const isModuleName = (name: string): name is keyof LanguageTranslations => {
    return translations && name in translations;
  };

  // Enhanced translation function with comprehensive fallback
  const t = useCallback(<T extends keyof TranslationModules>(
    key: T | NestedKeyOf<TranslationModules[T]> | string,
    params?: TranslationInterpolationOptions
  ): string => {
    const keyStr = String(key);
    
    // Always try comprehensive fallback first
    const fallbackResult = getNestedValue(COMPREHENSIVE_AZ_FALLBACK as any, keyStr, params);
    
    // If we have translations, try to get the actual translation
    if (translations) {
      // Handle direct module access
      if (keyStr in translations) {
        const module = translations[keyStr as keyof LanguageTranslations];
        return typeof module === 'string' ? module : fallbackResult;
      }
      
      // Handle nested keys
      const [moduleName, ...path] = keyStr.split('.');
      
      if (moduleName && isModuleName(moduleName) && translations[moduleName]) {
        const module = translations[moduleName];
        const nestedKey = path.join('.');
        
        if (typeof module === 'string') {
          return module;
        }
        
        const result = getNestedValue(module, nestedKey, params);
        return result !== keyStr ? result : fallbackResult;
      }
    }
    
    // Return fallback if no translation found
    return fallbackResult !== keyStr ? fallbackResult : keyStr.split('.').pop() || keyStr;
  }, [translations]);

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
