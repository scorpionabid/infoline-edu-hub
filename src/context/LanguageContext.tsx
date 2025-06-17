
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, LanguageContextValue } from '@/types/language';

interface Translation {
  [key: string]: string | Translation;
}

const defaultLanguage: SupportedLanguage = (localStorage.getItem('language') as SupportedLanguage) || 'az';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  translations: {
    [lang in SupportedLanguage]: Translation;
  };
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, translations }) => {
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  useEffect(() => {
    setIsLoading(true);
    try {
      // Simulate loading translations (if needed)
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    } catch (e: any) {
      setError(e);
      setIsLoading(false);
    }
  }, [language]);

  const t = (key: string, params: Record<string, any> = {}): string => {
    if (!translations[language]) {
      console.warn(`No translations found for language: ${language}`);
      return key;
    }

    let translation = translations[language][key] as string;

    if (!translation) {
      console.warn(`Translation not found for key: ${key} in language: ${language}`);
      return key;
    }

    for (const param in params) {
      const regex = new RegExp(`{${param}}`, 'g');
      translation = translation.replace(regex, params[param]);
    }

    return translation;
  };

  const tBatch = (keys: string[], params: Record<string, any> = {}): Record<string, string> => {
    const batchTranslations: Record<string, string> = {};
    keys.forEach(key => {
      batchTranslations[key] = t(key, params);
    });
    return batchTranslations;
  };

  const tSafe = (key: string, fallback: string = key, params: Record<string, any> = {}): string => {
    try {
      return t(key, params);
    } catch (e) {
      return fallback;
    }
  };

  const value: LanguageContextValue = {
    _performance: {
      language,
      isLoading,
      error: !!error
    },
    t,
    tBatch,
    tSafe,
    language,
    setLanguage,
    isLoading,
    error
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// useOptimizedTranslation alias - əsas səbəb bu idi
export const useOptimizedTranslation = useLanguage;

export { LanguageProvider, LanguageContext };

export const useLanguageSafe = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      _performance: {
        language: 'az' as SupportedLanguage,
        isLoading: false,
        error: false
      },
      t: (key: string) => key,
      tBatch: (keys: string[]) => keys.reduce((acc, key) => ({ ...acc, [key]: key }), {}),
      tSafe: (key: string, fallback?: string) => fallback || key,
      language: 'az' as SupportedLanguage,
      setLanguage: () => {},
      isLoading: false,
      error: null
    };
  }
  return context;
};
