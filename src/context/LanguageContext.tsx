
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
      // Common
      dashboard: 'İdarə paneli',
      regions: 'Regionlar',
      sectors: 'Sektorlar',
      schools: 'Məktəblər',
      categories: 'Kateqoriyalar',
      columns: 'Sütunlar',
      users: 'İstifadəçilər',
      reports: 'Hesabatlar',
      settings: 'Parametrlər',
      logout: 'Çıxış',
      profile: 'Profil',
      notifications: 'Bildirişlər',
      search: 'Axtarış',
      loading: 'Yüklənir...',
      language: 'Dil',
      theme: 'Tema',
      dark: 'Qaranlıq',
      light: 'İşıqlı',
      system: 'Sistem',
      save: 'Yadda saxla',
      cancel: 'Ləğv et',
      delete: 'Sil',
      edit: 'Düzəliş et',
      add: 'Əlavə et',
      view: 'Göstər',
      approve: 'Təsdiqlə',
      reject: 'Rədd et',
      export: 'İxrac et',
      import: 'İdxal et',
      
      // Auth
      login: 'Daxil ol',
      email: 'E-poçt',
      password: 'Şifrə',
      forgotPassword: 'Şifrəni unutmusunuz?',
      resetPassword: 'Şifrəni sıfırla',
      
      // Dashboard
      welcomeBack: 'Xoş gəldiniz',
      completionRate: 'Tamamlanma faizi',
      pendingApprovals: 'Gözləyən təsdiqlər',
      latestNotifications: 'Son bildirişlər',
      quickActions: 'Sürətli əməliyyatlar',
      statistics: 'Statistika',
      
      // Super Admin specific
      totalRegions: 'Ümumi regionlar',
      totalSectors: 'Ümumi sektorlar',
      totalSchools: 'Ümumi məktəblər',
      totalUsers: 'Ümumi istifadəçilər',
      systemActivity: 'Sistem aktivliyi',
      
      // Region and Sector specific
      pendingSchools: 'Məlumat gözləyən məktəblər',
      approvedSchools: 'Təsdiqlənmiş məktəblər',
      rejectedSchools: 'Rədd edilmiş məktəblər',
      
      // School specific
      pendingForms: 'Gözləyən formalar',
      approvedForms: 'Təsdiqlənmiş formalar',
      rejectedForms: 'Rədd edilmiş formalar',
      dueSoon: 'Son tarixi yaxınlaşan',
      overdue: 'Gecikdirilmiş',
      
      // Notifications
      newCategory: 'Yeni kateqoriya',
      formApproved: 'Form təsdiqləndi',
      formRejected: 'Form rədd edildi',
      dueDateReminder: 'Son tarix xatırlatması',
      systemUpdate: 'Sistem yeniləməsi',
      
      // Not found
      notFound: 'Səhifə tapılmadı',
      goBack: 'Geri qayıt',
    }
  },
  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    translations: {
      // Common
      dashboard: 'Панель управления',
      regions: 'Регионы',
      sectors: 'Секторы',
      schools: 'Школы',
      categories: 'Категории',
      columns: 'Столбцы',
      users: 'Пользователи',
      reports: 'Отчеты',
      settings: 'Настройки',
      logout: 'Выход',
      profile: 'Профиль',
      notifications: 'Уведомления',
      search: 'Поиск',
      loading: 'Загрузка...',
      language: 'Язык',
      theme: 'Тема',
      dark: 'Темная',
      light: 'Светлая',
      system: 'Системная',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      add: 'Добавить',
      view: 'Просмотр',
      approve: 'Утвердить',
      reject: 'Отклонить',
      export: 'Экспорт',
      import: 'Импорт',
      
      // Auth
      login: 'Войти',
      email: 'Эл. почта',
      password: 'Пароль',
      forgotPassword: 'Забыли пароль?',
      resetPassword: 'Сбросить пароль',
      
      // Dashboard
      welcomeBack: 'Добро пожаловать',
      completionRate: 'Процент заполнения',
      pendingApprovals: 'Ожидающие утверждения',
      latestNotifications: 'Последние уведомления',
      quickActions: 'Быстрые действия',
      statistics: 'Статистика',
      
      // Super Admin specific
      totalRegions: 'Всего регионов',
      totalSectors: 'Всего секторов',
      totalSchools: 'Всего школ',
      totalUsers: 'Всего пользователей',
      systemActivity: 'Активность системы',
      
      // Region and Sector specific
      pendingSchools: 'Школы ожидающие данных',
      approvedSchools: 'Утвержденные школы',
      rejectedSchools: 'Отклоненные школы',
      
      // School specific
      pendingForms: 'Ожидающие формы',
      approvedForms: 'Утвержденные формы',
      rejectedForms: 'Отклоненные формы',
      dueSoon: 'Скоро срок',
      overdue: 'Просрочено',
      
      // Notifications
      newCategory: 'Новая категория',
      formApproved: 'Форма утверждена',
      formRejected: 'Форма отклонена',
      dueDateReminder: 'Напоминание о сроке',
      systemUpdate: 'Обновление системы',
      
      // Not found
      notFound: 'Страница не найдена',
      goBack: 'Вернуться назад',
    }
  },
  tr: {
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    translations: {
      // Common
      dashboard: 'Kontrol Paneli',
      regions: 'Bölgeler',
      sectors: 'Sektörler',
      schools: 'Okullar',
      categories: 'Kategoriler',
      columns: 'Sütunlar',
      users: 'Kullanıcılar',
      reports: 'Raporlar',
      settings: 'Ayarlar',
      logout: 'Çıkış',
      profile: 'Profil',
      notifications: 'Bildirimler',
      search: 'Ara',
      loading: 'Yükleniyor...',
      language: 'Dil',
      theme: 'Tema',
      dark: 'Karanlık',
      light: 'Aydınlık',
      system: 'Sistem',
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      view: 'Görüntüle',
      approve: 'Onayla',
      reject: 'Reddet',
      export: 'Dışa Aktar',
      import: 'İçe Aktar',
      
      // Auth
      login: 'Giriş',
      email: 'E-posta',
      password: 'Şifre',
      forgotPassword: 'Şifrenizi mi unuttunuz?',
      resetPassword: 'Şifreyi sıfırla',
      
      // Dashboard
      welcomeBack: 'Hoş Geldiniz',
      completionRate: 'Tamamlanma Oranı',
      pendingApprovals: 'Bekleyen Onaylar',
      latestNotifications: 'Son Bildirimler',
      quickActions: 'Hızlı İşlemler',
      statistics: 'İstatistikler',
      
      // Super Admin specific
      totalRegions: 'Toplam Bölgeler',
      totalSectors: 'Toplam Sektörler',
      totalSchools: 'Toplam Okullar',
      totalUsers: 'Toplam Kullanıcılar',
      systemActivity: 'Sistem Aktivitesi',
      
      // Region and Sector specific
      pendingSchools: 'Veri Bekleyen Okullar',
      approvedSchools: 'Onaylanmış Okullar',
      rejectedSchools: 'Reddedilmiş Okullar',
      
      // School specific
      pendingForms: 'Bekleyen Formlar',
      approvedForms: 'Onaylanmış Formlar',
      rejectedForms: 'Reddedilmiş Formlar',
      dueSoon: 'Yakında Sona Erecek',
      overdue: 'Süresi Geçmiş',
      
      // Notifications
      newCategory: 'Yeni Kategori',
      formApproved: 'Form Onaylandı',
      formRejected: 'Form Reddedildi',
      dueDateReminder: 'Son Tarih Hatırlatması',
      systemUpdate: 'Sistem Güncellemesi',
      
      // Not found
      notFound: 'Sayfa Bulunamadı',
      goBack: 'Geri Dön',
    }
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    translations: {
      // Common
      dashboard: 'Dashboard',
      regions: 'Regions',
      sectors: 'Sectors',
      schools: 'Schools',
      categories: 'Categories',
      columns: 'Columns',
      users: 'Users',
      reports: 'Reports',
      settings: 'Settings',
      logout: 'Logout',
      profile: 'Profile',
      notifications: 'Notifications',
      search: 'Search',
      loading: 'Loading...',
      language: 'Language',
      theme: 'Theme',
      dark: 'Dark',
      light: 'Light',
      system: 'System',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      view: 'View',
      approve: 'Approve',
      reject: 'Reject',
      export: 'Export',
      import: 'Import',
      
      // Auth
      login: 'Login',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      
      // Dashboard
      welcomeBack: 'Welcome Back',
      completionRate: 'Completion Rate',
      pendingApprovals: 'Pending Approvals',
      latestNotifications: 'Latest Notifications',
      quickActions: 'Quick Actions',
      statistics: 'Statistics',
      
      // Super Admin specific
      totalRegions: 'Total Regions',
      totalSectors: 'Total Sectors',
      totalSchools: 'Total Schools',
      totalUsers: 'Total Users',
      systemActivity: 'System Activity',
      
      // Region and Sector specific
      pendingSchools: 'Schools Pending Data',
      approvedSchools: 'Approved Schools',
      rejectedSchools: 'Rejected Schools',
      
      // School specific
      pendingForms: 'Pending Forms',
      approvedForms: 'Approved Forms',
      rejectedForms: 'Rejected Forms',
      dueSoon: 'Due Soon',
      overdue: 'Overdue',
      
      // Notifications
      newCategory: 'New Category',
      formApproved: 'Form Approved',
      formRejected: 'Form Rejected',
      dueDateReminder: 'Due Date Reminder',
      systemUpdate: 'System Update',
      
      // Not found
      notFound: 'Page Not Found',
      goBack: 'Go Back',
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
