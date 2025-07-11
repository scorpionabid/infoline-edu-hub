import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'az' | 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const translations = {
  az: {
    'user.name': 'Ad',
    'user.email': 'Email',
    'user.phone': 'Telefon',
    'user.position': 'Vəzifə',
    'user.role': 'Rol',
    'sector': 'Sektor',
    'region': 'Region',
    'school': 'Məktəb',
    'save': 'Yadda saxla',
    'cancel': 'Ləğv et',
    'select': 'Seç'
  },
  en: {
    'user.name': 'Name',
    'user.email': 'Email',
    'user.phone': 'Phone',
    'user.position': 'Position',
    'user.role': 'Role',
    'sector': 'Sector',
    'region': 'Region',
    'school': 'School',
    'save': 'Save',
    'cancel': 'Cancel',
    'select': 'Select'
  },
  ru: {
    'user.name': 'Имя',
    'user.email': 'Email',
    'user.phone': 'Телефон',
    'user.position': 'Должность',
    'user.role': 'Роль',
    'sector': 'Сектор',
    'region': 'Регион',
    'school': 'Школа',
    'save': 'Сохранить',
    'cancel': 'Отмена',
    'select': 'Выбрать'
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('az');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['az']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};