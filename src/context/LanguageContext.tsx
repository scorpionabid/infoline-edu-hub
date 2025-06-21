
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'az' | 'en' | 'tr' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Basic translations for essential keys
const translations: Record<Language, Record<string, string>> = {
  az: {
    loading: 'Yüklənir...',
    save: 'Saxla',
    cancel: 'Ləğv et',
    submit: 'Təsdiq et',
    edit: 'Redaktə et',
    delete: 'Sil',
    confirm: 'Təsdiq et',
    error: 'Xəta',
    success: 'Müvəffəqiyyət',
    close: 'Bağla'
  },
  en: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    error: 'Error',
    success: 'Success',
    close: 'Close'
  },
  tr: {
    loading: 'Yükleniyor...',
    save: 'Kaydet',
    cancel: 'İptal',
    submit: 'Gönder',
    edit: 'Düzenle',
    delete: 'Sil',
    confirm: 'Onayla',
    error: 'Hata',
    success: 'Başarılı',
    close: 'Kapat'
  },
  ru: {
    loading: 'Загрузка...',
    save: 'Сохранить',
    cancel: 'Отмена',
    submit: 'Отправить',
    edit: 'Редактировать',
    delete: 'Удалить',
    confirm: 'Подтвердить',
    error: 'Ошибка',
    success: 'Успех',
    close: 'Закрыть'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('az');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const useLanguageSafe = () => {
  try {
    return useLanguage();
  } catch (error) {
    return {
      t: (key: string) => key,
      language: 'az' as const,
      setLanguage: () => {}
    };
  }
};
