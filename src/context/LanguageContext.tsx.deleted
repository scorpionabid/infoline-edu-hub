
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import i18next, { i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import az from '@/locales/az.json';
import ru from '@/locales/ru.json';
import tr from '@/locales/tr.json';
import { SupportedLanguage } from '@/types/translation';
import { TranslationValidator } from '@/utils/translationValidator';

// Add loading state type
type I18nLoadingState = {
  isLoading: boolean;
  error: Error | null;
};

interface Language {
  nativeName: string;
  flag: string;
}

export interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string, options?: any) => string;
  i18n: typeof i18next;
  isRtl: boolean;
  availableLanguages: SupportedLanguage[];
  currentLanguage: SupportedLanguage;
  languages: Record<SupportedLanguage, Language>;
  supportedLanguages: SupportedLanguage[];
  loadingState: I18nLoadingState;
}

const languages: Record<SupportedLanguage, Language> = {
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' }
};

const supportedLanguages: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<I18nLoadingState>({ 
    isLoading: true, 
    error: null 
  });
  const [language, setLanguageState] = useState<SupportedLanguage>('az');
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);

  // Initialize i18next
  useEffect(() => {
    const initI18n = async () => {
      try {
        setLoadingState({ isLoading: true, error: null });
        
        // Get saved language or default to 'az'
        const savedLanguage = (localStorage.getItem('i18nextLng') as SupportedLanguage) || 'az';
        const initialLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : 'az';
        
        // Create and initialize i18n instance
        const instance = i18next.createInstance();
        
        await instance
          .use(initReactI18next)
          .init({
            resources: {
              en: { translation: en },
              az: { translation: az },
              ru: { translation: ru },
              tr: { translation: tr },
            },
            lng: initialLanguage,
            fallbackLng: 'az',
            interpolation: { escapeValue: false },
            debug: process.env.NODE_ENV === 'development',
            saveMissing: true,
            missingKeyHandler: (lngs, ns, key) => {
              if (process.env.NODE_ENV === 'development') {
                console.warn(`Missing translation: ${key} for language ${lngs}`);
              }
            },
            parseMissingKeyHandler: (key) => {
              if (process.env.NODE_ENV === 'development') {
                console.warn(`Missing translation key: ${key}`);
              }
              return key; // Return key as fallback
            }
          });

        setI18nInstance(instance);
        setLanguageState(initialLanguage);
        setLoadingState({ isLoading: false, error: null });
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setLoadingState({ 
          isLoading: false, 
          error: error instanceof Error ? error : new Error('Failed to initialize i18n') 
        });
      }
    };

    initI18n();
  }, []);

  const changeLanguage = useCallback(async (lang: string) => {
    if (!i18nInstance) return;
    
    const supportedLang = lang as SupportedLanguage;
    if (!supportedLanguages.includes(supportedLang)) return;
    
    try {
      setLoadingState(prev => ({ ...prev, isLoading: true }));
      await i18nInstance.changeLanguage(supportedLang);
      setLanguageState(supportedLang);
      localStorage.setItem('i18nextLng', supportedLang);
      
      // Validate translations in development
      if (process.env.NODE_ENV === 'development') {
        const validationResult = TranslationValidator.validateLanguage(
          supportedLang,
          (key: string) => i18nInstance.t(key)
        );
        TranslationValidator.logValidationResults(supportedLang, validationResult);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  }, [i18nInstance]);

  const t = useCallback((key: string, options?: any): string => {
    if (!i18nInstance) return key;
    const translated = i18nInstance.t(key, options);
    return typeof translated === 'string' ? translated : key;
  }, [i18nInstance]);

  const isRtl = useMemo(() => i18nInstance?.dir() === 'rtl' || false, [i18nInstance]);

  // Show loading state while initializing
  if (loadingState.isLoading || !i18nInstance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (loadingState.error) {
    return (
      <div className="p-4 text-red-600">
        <p>Failed to load translations: {loadingState.error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    i18n: i18nInstance,
    isRtl,
    availableLanguages: supportedLanguages,
    currentLanguage: language,
    languages,
    supportedLanguages,
    loadingState,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const defaultContext: LanguageContextProps = {
  language: 'az',
  setLanguage: async () => {},
  t: (key) => key,
  i18n: i18next,
  isRtl: false,
  availableLanguages: supportedLanguages,
  currentLanguage: 'az',
  languages,
  supportedLanguages,
  loadingState: { isLoading: false, error: null },
};

export const useLanguageSafe = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  return context || defaultContext;
};
