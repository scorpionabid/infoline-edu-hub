
import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageType = 'az' | 'en' | 'tr' | 'ru';

export interface LanguageContextType {
  currentLanguage: LanguageType;
  language: LanguageType; // Add this for backward compatibility
  setLanguage: (lang: LanguageType) => void;
  t: (key: string, fallback?: string) => string;
  tSafe: (key: string, fallback?: string) => string;
  isLoading?: boolean;
  isReady?: boolean;
  error?: string | null;
}

const translations: Record<LanguageType, Record<string, string>> = {
  az: {
    'dashboardLabel': 'İdarə Paneli',
    'logout': 'Çıxış',
    'dashboard.title': 'İdarə Paneli',
    'dashboard.subtitle': 'Dashboard məzmunu',
    'users.add': 'İstifadəçi Əlavə Et',
    'users.email': 'E-poçt',
    'users.fullName': 'Ad və Soyad',
    'users.role': 'Rol',
    'users.phone': 'Telefon',
    'users.position': 'Vəzifə',
    'users.selectRole': 'Rol seçin',
    'users.addSuccess': 'İstifadəçi uğurla əlavə edildi',
    'users.addError': 'İstifadəçi əlavə edilərkən xəta baş verdi',
    'common.cancel': 'Ləğv et',
    'common.loading': 'Yüklənir...',
    'roles.superadmin': 'Super Admin',
    'roles.regionadmin': 'Region Admin',
    'roles.sectoradmin': 'Sektor Admin',
    'roles.schooladmin': 'Məktəb Admin',
    'theme.light': 'Açıq',
    'theme.dark': 'Qaranlıq'
  },
  en: {
    'dashboardLabel': 'Dashboard',
    'logout': 'Logout',
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Dashboard content',
    'users.add': 'Add User',
    'users.email': 'Email',
    'users.fullName': 'Full Name',
    'users.role': 'Role',
    'users.phone': 'Phone',
    'users.position': 'Position',
    'users.selectRole': 'Select Role',
    'users.addSuccess': 'User added successfully',
    'users.addError': 'Error adding user',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'roles.superadmin': 'Super Admin',
    'roles.regionadmin': 'Region Admin',
    'roles.sectoradmin': 'Sector Admin',
    'roles.schooladmin': 'School Admin',
    'theme.light': 'Light',
    'theme.dark': 'Dark'
  },
  tr: {
    'dashboardLabel': 'Kontrol Paneli',
    'logout': 'Çıkış',
    'dashboard.title': 'Kontrol Paneli',
    'dashboard.subtitle': 'Dashboard içeriği',
    'users.add': 'Kullanıcı Ekle',
    'users.email': 'E-posta',
    'users.fullName': 'Ad Soyad',
    'users.role': 'Rol',
    'users.phone': 'Telefon',
    'users.position': 'Pozisyon',
    'users.selectRole': 'Rol Seçin',
    'users.addSuccess': 'Kullanıcı başarıyla eklendi',
    'users.addError': 'Kullanıcı eklenirken hata oluştu',
    'common.cancel': 'İptal',
    'common.loading': 'Yükleniyor...',
    'roles.superadmin': 'Süper Admin',
    'roles.regionadmin': 'Bölge Admin',
    'roles.sectoradmin': 'Sektör Admin',
    'roles.schooladmin': 'Okul Admin',
    'theme.light': 'Açık',
    'theme.dark': 'Karanlık'
  },
  ru: {
    'dashboardLabel': 'Панель управления',
    'logout': 'Выход',
    'dashboard.title': 'Панель управления',
    'dashboard.subtitle': 'Содержимое панели',
    'users.add': 'Добавить пользователя',
    'users.email': 'Эл. почта',
    'users.fullName': 'Полное имя',
    'users.role': 'Роль',
    'users.phone': 'Телефон',
    'users.position': 'Должность',
    'users.selectRole': 'Выберите роль',
    'users.addSuccess': 'Пользователь успешно добавлен',
    'users.addError': 'Ошибка при добавлении пользователя',
    'common.cancel': 'Отмена',
    'common.loading': 'Загрузка...',
    'roles.superadmin': 'Супер Админ',
    'roles.regionadmin': 'Региональный Админ',
    'roles.sectoradmin': 'Секторный Админ',
    'roles.schooladmin': 'Школьный Админ',
    'theme.light': 'Светлая',
    'theme.dark': 'Темная'
  }
};

const TranslationContext = createContext<LanguageContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageType>('az');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLanguage = (lang: LanguageType) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[currentLanguage]?.[key] || fallback || key;
  };

  const tSafe = (key: string, fallback?: string): string => {
    return translations[currentLanguage]?.[key] || fallback || key;
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') as LanguageType;
    if (savedLang && ['az', 'en', 'tr', 'ru'].includes(savedLang)) {
      setCurrentLanguage(savedLang);
    }
  }, []);

  return (
    <TranslationContext.Provider value={{ 
      currentLanguage, 
      language: currentLanguage, // For backward compatibility
      setLanguage, 
      t, 
      tSafe,
      isLoading,
      isReady: !isLoading && !error,
      error
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
