
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import translations from '@/translations';
import { Language } from '@/types/language';

interface LanguageContextType {
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => void;
  languages: { value: Language, label: string, flag: string, nativeName: string }[];
}

// Default dil təyin edirik
export const defaultLang: Language = 'az';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      // Əvvəlcə localStoragedən oxumağa çalışırıq
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && Object.values(['az', 'en', 'ru', 'tr']).includes(savedLanguage as Language)) {
        return savedLanguage as Language;
      }
      
      // Əgər browser dilini təyin etmək istəyiriksə, onun əsasında dili seçirik
      const browserLang = navigator.language.split('-')[0];
      if (Object.values(['az', 'en', 'ru', 'tr']).includes(browserLang as Language)) {
        return browserLang as Language;
      }
      
      return defaultLang;
    } catch (e) {
      console.warn('Dil seçimi xətası:', e);
      return defaultLang;
    }
  });
  
  const languages = [
    { value: 'az' as Language, label: 'Azərbaycan', flag: '🇦🇿', nativeName: 'Azərbaycan' },
    { value: 'en' as Language, label: 'English', flag: '🇬🇧', nativeName: 'English' },
    { value: 'ru' as Language, label: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
    { value: 'tr' as Language, label: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' },
  ];
  
  useEffect(() => {
    try {
      localStorage.setItem('language', language);
      console.log(`Dil dəyişdirildi: ${language}`);
      document.documentElement.setAttribute('lang', language);
    } catch (e) {
      console.warn('Dil saxlanması xətası:', e);
    }
  }, [language]);
  
  const t = (key: string, params?: Record<string, string | number>) => {
    try {
      const keys = key.split('.');
      let text: any = translations[language];
      
      // Daxili açarlar üçün nöqtəli notasiya yoxlanılır
      for (const k of keys) {
        if (text && text[k]) {
          text = text[k];
        } else {
          // Əgər tərcümə tapılmırsa, ilk olaraq defaultLanguage'ə baxaq
          let defaultText = translations[defaultLang];
          for (const dk of keys) {
            if (defaultText && defaultText[dk]) {
              defaultText = defaultText[dk];
            } else {
              defaultText = undefined;
              break;
            }
          }
          
          // Əgər default dildə də yoxdursa, açarın özünü qaytaraq
          text = defaultText || key;
          break;
        }
      }
      
      if (typeof text === 'string' && params) {
        // Parametrləri string'də əvəzləyirik, məs: {name} -> John
        return Object.entries(params).reduce((result, [paramKey, value]) => {
          const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
          return result.replace(regex, String(value));
        }, text);
      }
      
      return typeof text === 'string' ? text : key;
    } catch (e) {
      console.warn(`Tərcümə xətası (${key}):`, e);
      return key;
    }
  };
  
  const handleSetLanguage = (newLang: Language) => {
    if (newLang !== language) {
      setLanguage(newLang);
    }
  };
  
  return (
    <LanguageContext.Provider value={{ language, t, setLanguage: handleSetLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    console.error('useLanguage hook must be used within a LanguageProvider');
    // Fallback funksiya təmin et, səhvləri azaltmaq üçün
    return {
      language: defaultLang,
      t: (key: string) => key,
      setLanguage: () => {},
      languages: [
        { value: 'az' as Language, label: 'Azərbaycan', flag: '🇦🇿', nativeName: 'Azərbaycan' },
        { value: 'en' as Language, label: 'English', flag: '🇬🇧', nativeName: 'English' },
        { value: 'ru' as Language, label: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
        { value: 'tr' as Language, label: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' },
      ]
    };
  }
  
  return context;
};

// useLanguageSafe adı ilə eyni funksiyadan alias yaradırıq
// Bu həlledici rol oynayır, DataEntryProgress komponenti bu altsözü istifadə edir
export const useLanguageSafe = useLanguage;

export const useTranslation = useLanguage;
