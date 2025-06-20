
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getTranslations } from '@/translations';
import type { SupportedLanguage, LanguageTranslations } from '@/types/translation';
import { translationCache } from '@/services/translationCache';

export interface TranslationContextType {
  t: (key: string, interpolation?: Record<string, any>) => string;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  clearCache: () => void;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: React.ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  defaultLanguage = 'az' 
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);
  const [translations, setTranslations] = useState<LanguageTranslations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced translation function with caching and interpolation
  const t = useCallback((key: string, interpolation?: Record<string, any>): string => {
    if (!translations) {
      return key.split('.').pop() || key;
    }

    try {
      const keys = key.split('.');
      let value: any = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to key末segment or full key
          return key.split('.').pop() || key;
        }
      }

      let result = typeof value === 'string' ? value : key;

      // Handle interpolation
      if (interpolation && typeof result === 'string') {
        Object.entries(interpolation).forEach(([param, val]) => {
          const regex = new RegExp(`{{\\s*${param}\\s*}}`, 'g');
          result = result.replace(regex, String(val));
        });
      }

      return result;
    } catch (err) {
      console.warn(`Translation error for key: ${key}`, err);
      return key.split('.').pop() || key;
    }
  }, [translations]);

  // Load translations with caching
  const loadTranslations = useCallback(async (lang: SupportedLanguage) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      let cached = translationCache.get(lang);
      
      if (cached) {
        setTranslations(cached);
        setIsLoading(false);
        return cached;
      }

      // Load from source
      const newTranslations = await getTranslations(lang);
      
      // Cache the result
      translationCache.set(lang, newTranslations);
      setTranslations(newTranslations);
      
      return newTranslations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation loading failed';
      console.error(`Failed to load translations for ${lang}:`, err);
      setError(errorMessage);
      
      // Fallback to cached Azerbaijani if available
      if (lang !== 'az') {
        const fallback = translationCache.get('az');
        if (fallback) {
          setTranslations(fallback);
          console.warn('Using cached Azerbaijani translations as fallback');
        }
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhanced language change with persistence
  const changeLanguage = useCallback(async (newLang: SupportedLanguage) => {
    if (newLang === language) return;

    try {
      await loadTranslations(newLang);
      setLanguageState(newLang);
      
      // Persist language preference
      localStorage.setItem('preferred_language', newLang);
      
      // Preload other languages in background
      if (newLang === 'az') {
        setTimeout(() => translationCache.preload('en'), 1000);
      } else {
        setTimeout(() => translationCache.preload('az'), 1000);
      }
      
    } catch (err) {
      console.error('Language change failed:', err);
      setError('Failed to change language');
    }
  }, [language, loadTranslations]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    changeLanguage(lang);
  }, [changeLanguage]);

  // Clear cache function
  const clearCache = useCallback(() => {
    translationCache.clear();
    setTranslations(null);
    // Reload current language
    loadTranslations(language);
  }, [language, loadTranslations]);

  // Initialize translations
  useEffect(() => {
    // Check for saved language preference
    const savedLang = localStorage.getItem('preferred_language') as SupportedLanguage;
    const initialLang = savedLang || defaultLanguage;
    
    if (initialLang !== language) {
      setLanguageState(initialLang);
    }
    
    loadTranslations(initialLang);
    
    // Development helper - expose cache clear function globally
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).clearTranslationCache = () => {
        translationCache.clear();
        setTranslations(null);
        loadTranslations(language);
        console.log('Translation cache cleared and reloaded!');
      };
    }
  }, []); // Only run once on mount

  // Memoized context value
  const contextValue = useMemo(() => ({
    t,
    language,
    setLanguage,
    changeLanguage,
    clearCache,
    isLoading,
    error,
    isReady: !!translations && !isLoading
  }), [t, language, setLanguage, changeLanguage, clearCache, isLoading, error, translations]);

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;
