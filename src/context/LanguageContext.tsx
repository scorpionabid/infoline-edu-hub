import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define language options
export type Language = 'az' | 'ru' | 'tr' | 'en';

// Define translations type
type TranslationKeys = {
  [key: string]: string;
};

// Language data
type LanguageData = {
  name: string;
  nativeName: string;
  flag: string;
  translations: TranslationKeys;
};

// Define available languages
const languages: Record<Language, LanguageData> = {
  az: {
    name: 'Azerbaijani',
    nativeName: 'Azərbaycan',
    flag: '🇦🇿',
    translations: {
      // Əvvəlki tərcümələr saxlanılır
      // ... keep existing code (translations)
      
      // Yeni əlavə edilən tərcümələr
      currentLanguage: 'az',
      refresh: 'Yenilə',
      systemActivity: 'Sistem Aktivliyi',
      dataOverview: 'Məlumat İcmalı',
      pendingTasks: 'Gözləyən Tapşırıqlar',
      lastUpdated: 'Son Yenilənmə',
      viewAll: 'Hamısına Bax',
      categoryManagement: 'Kateqoriya İdarəetməsi',
      userManagement: 'İstifadəçi İdarəetməsi',
      schoolManagement: 'Məktəb İdarəetməsi',
      sectorManagement: 'Sektor İdarəetməsi',
      regionManagement: 'Region İdarəetməsi',
      allCategories: 'Bütün Kateqoriyalar',
      createCategory: 'Kateqoriya Yarat',
      createColumn: 'Sütun Yarat',
      allUsers: 'Bütün İstifadəçilər',
      createUser: 'İstifadəçi Yarat',
      assignRole: 'Rol Təyin Et',
      dataSubmission: 'Məlumat Təqdimi',
      approvalProcess: 'Təsdiq Prosesi',
      dataValidation: 'Məlumat Validasiyası',
      comparisonReport: 'Müqayisə Hesabatı',
      timeSeriesAnalysis: 'Vaxt Seriyası Analizi',
      dateRange: 'Tarix Aralığı',
      compareWith: 'İlə Müqayisə Et',
      applyFilters: 'Filtirləri Tətbiq Et',
      resetFilters: 'Filtirləri Sıfırla',
      today: 'Bu Gün',
      yesterday: 'Dünən',
      lastWeek: 'Keçən Həftə',
      lastMonth: 'Keçən Ay',
      custom: 'Xüsusi',
    }
  },
  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    translations: {
      // Əvvəlki tərcümələr saxlanılır
      // ... keep existing code (translations)
      
      // Yeni əlavə edilən tərcümələr
      currentLanguage: 'ru',
      refresh: 'Обновить',
      systemActivity: 'Активность Системы',
      dataOverview: 'Обзор Данных',
      pendingTasks: 'Ожидающие Задачи',
      lastUpdated: 'Последнее Обновление',
      viewAll: 'Смотреть Все',
      categoryManagement: 'Управление Категориями',
      userManagement: 'Управление Пользователями',
      schoolManagement: 'Управление Школами',
      sectorManagement: 'Управление Секторами',
      regionManagement: 'Управление Регионами',
      allCategories: 'Все Категории',
      createCategory: 'Создать Категорию',
      createColumn: 'Создать Столбец',
      allUsers: 'Все Пользователи',
      createUser: 'Создать Пользователя',
      assignRole: 'Назначить Роль',
      dataSubmission: 'Подача Данных',
      approvalProcess: 'Процесс Утверждения',
      dataValidation: 'Валидация Данных',
      comparisonReport: 'Сравнительный Отчет',
      timeSeriesAnalysis: 'Анализ Временных Рядов',
      dateRange: 'Диапазон Дат',
      compareWith: 'Сравнить с',
      applyFilters: 'Применить Фильтры',
      resetFilters: 'Сбросить Фильтры',
      today: 'Сегодня',
      yesterday: 'Вчера',
      lastWeek: 'Прошлая Неделя',
      lastMonth: 'Прошлый Месяц',
      custom: 'Пользовательский',
    }
  },
  tr: {
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    translations: {
      // Əvvəlki tərcümələr saxlanılır
      // ... keep existing code (translations)
      
      // Yeni əlavə edilən tərcümələr
      currentLanguage: 'tr',
      refresh: 'Yenile',
      systemActivity: 'Sistem Aktivitesi',
      dataOverview: 'Veri Genel Bakışı',
      pendingTasks: 'Bekleyen Görevler',
      lastUpdated: 'Son Güncelleme',
      viewAll: 'Tümünü Görüntüle',
      categoryManagement: 'Kategori Yönetimi',
      userManagement: 'Kullanıcı Yönetimi',
      schoolManagement: 'Okul Yönetimi',
      sectorManagement: 'Sektör Yönetimi',
      regionManagement: 'Bölge Yönetimi',
      allCategories: 'Tüm Kategoriler',
      createCategory: 'Kategori Oluştur',
      createColumn: 'Sütun Oluştur',
      allUsers: 'Tüm Kullanıcılar',
      createUser: 'Kullanıcı Oluştur',
      assignRole: 'Rol Ata',
      dataSubmission: 'Veri Gönderimi',
      approvalProcess: 'Onay Süreci',
      dataValidation: 'Veri Doğrulama',
      comparisonReport: 'Karşılaştırma Raporu',
      timeSeriesAnalysis: 'Zaman Serisi Analizi',
      dateRange: 'Tarih Aralığı',
      compareWith: 'Karşılaştır',
      applyFilters: 'Filtreleri Uygula',
      resetFilters: 'Filtreleri Sıfırla',
      today: 'Bugün',
      yesterday: 'Dün',
      lastWeek: 'Geçen Hafta',
      lastMonth: 'Geçen Ay',
      custom: 'Özel',
    }
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    translations: {
      // Əvvəlki tərcümələr saxlanılır
      // ... keep existing code (translations)
      
      // Yeni əlavə edilən tərcümələr
      currentLanguage: 'en',
      refresh: 'Refresh',
      systemActivity: 'System Activity',
      dataOverview: 'Data Overview',
      pendingTasks: 'Pending Tasks',
      lastUpdated: 'Last Updated',
      viewAll: 'View All',
      categoryManagement: 'Category Management',
      userManagement: 'User Management',
      schoolManagement: 'School Management',
      sectorManagement: 'Sector Management',
      regionManagement: 'Region Management',
      allCategories: 'All Categories',
      createCategory: 'Create Category',
      createColumn: 'Create Column',
      allUsers: 'All Users',
      createUser: 'Create User',
      assignRole: 'Assign Role',
      dataSubmission: 'Data Submission',
      approvalProcess: 'Approval Process',
      dataValidation: 'Data Validation',
      comparisonReport: 'Comparison Report',
      timeSeriesAnalysis: 'Time Series Analysis',
      dateRange: 'Date Range',
      compareWith: 'Compare With',
      applyFilters: 'Apply Filters',
      resetFilters: 'Reset Filters',
      today: 'Today',
      yesterday: 'Yesterday',
      lastWeek: 'Last Week',
      lastMonth: 'Last Month',
      custom: 'Custom',
    }
  }
};

// Context type
interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: typeof languages;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Context provider props
interface LanguageProviderProps {
  children: ReactNode;
}

// Context provider
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get default language from localStorage or use 'az'
  const getDefaultLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('infoline-language') as Language;
    return savedLanguage || 'az';
  };

  const [currentLanguage, setCurrentLanguage] = useState<Language>(getDefaultLanguage);

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('infoline-language', currentLanguage);
  }, [currentLanguage]);

  // Translate function
  const t = (key: string): string => {
    return languages[currentLanguage].translations[key] || key;
  };

  // Set language
  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const value = {
    currentLanguage,
    setLanguage,
    t,
    languages,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
