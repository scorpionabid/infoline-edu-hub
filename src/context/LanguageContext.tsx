
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'az' | 'en' | 'tr' | 'ru';

interface LanguageInfo {
  nativeName: string;
  flag: string;
}

export interface LanguageContextType {
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  languages: Record<Language, LanguageInfo>;
  currentLanguage: Language;
}

const defaultLanguages: Record<Language, LanguageInfo> = {
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' }
};

// Context yaradılır
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Tərcümələr
type Translations = Record<string, Record<Language, string>>;

// Varsayılan tərcümələr (burada test üçün əsas olanları qeyd edirəm)
const translations: Translations = {
  login: {
    az: 'Daxil ol',
    en: 'Login',
    tr: 'Giriş',
    ru: 'Вход'
  },
  email: {
    az: 'E-poçt',
    en: 'Email',
    tr: 'E-posta',
    ru: 'Эл. почта'
  },
  password: {
    az: 'Şifrə',
    en: 'Password',
    tr: 'Şifre',
    ru: 'Пароль'
  },
  // ... digər tərcümələr əlavə edilə bilər
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('az');

  useEffect(() => {
    // Əgər lokalstorajda dil saxlanılıbsa, onu istifadə et
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && Object.keys(defaultLanguages).includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  const translate = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key '${key}' not found.`);
      return key;
    }

    if (!translations[key][currentLanguage]) {
      console.warn(`Translation for '${key}' in language '${currentLanguage}' not found.`);
      return key;
    }

    return translations[key][currentLanguage];
  };

  const value = {
    t: translate,
    setLanguage: changeLanguage,
    languages: defaultLanguages,
    currentLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Təhlükəsiz istifadə üçün əlavə bir hook (kontekst mövcud olmasa belə xəta atmaz)
export const useLanguageSafe = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    return {
      t: (key: string) => key,
      setLanguage: () => {},
      languages: defaultLanguages,
      currentLanguage: 'az' as Language
    };
  }
  return context;
};
