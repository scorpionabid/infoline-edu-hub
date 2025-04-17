
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export type Language = 'az' | 'en' | 'ru' | 'tr';

export interface LanguageInfo {
  flag: string;
  nativeName: string;
}

export interface Translations {
  [key: string]: string;
}

export interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
  availableLanguages: Record<Language, LanguageInfo>;
}

const defaultLanguage: Language = 'az';

const availableLanguages: Record<Language, LanguageInfo> = {
  az: { flag: '🇦🇿', nativeName: 'Azərbaycan' },
  en: { flag: '🇬🇧', nativeName: 'English' },
  ru: { flag: '🇷🇺', nativeName: 'Русский' },
  tr: { flag: '🇹🇷', nativeName: 'Türkçe' }
};

const translations: Record<Language, Translations> = {
  az: {
    dashboard: 'İdarə paneli',
    schools: 'Məktəblər',
    reports: 'Hesabatlar',
    settings: 'Parametrlər',
    logout: 'Çıxış',
    search: 'Axtar',
    schoolName: 'Məktəb adı',
    region: 'Region',
    sector: 'Sektor',
    principal: 'Direktor',
    status: 'Status',
    actions: 'Əməliyyatlar',
    addSchool: 'Məktəb əlavə et',
    edit: 'Redaktə et',
    delete: 'Sil',
    export: 'İxrac et',
    refresh: 'Yenilə',
    searchSchools: 'Məktəbləri axtar...',
    filterByRegion: 'Regiona görə filtrlə',
    filterBySector: 'Sektora görə filtrlə',
    filterByStatus: 'Statusa görə filtrlə',
    allRegions: 'Bütün regionlar',
    allSectors: 'Bütün sektorlar',
    allStatuses: 'Bütün statuslar',
    active: 'Aktiv',
    inactive: 'Deaktiv',
    blocked: 'Bloklanmış',
    schoolsList: 'Məktəblərin siyahısı',
    schoolCreated: 'Məktəb uğurla yaradıldı',
    schoolUpdated: 'Məktəb uğurla yeniləndi',
    schoolDeleted: 'Məktəb uğurla silindi',
    schoolCreationFailed: 'Məktəb yaradılarkən xəta baş verdi',
    schoolUpdateFailed: 'Məktəb yenilənərkən xəta baş verdi',
    schoolDeletionFailed: 'Məktəb silinərkən xəta baş verdi',
    schoolDetails: 'Məktəb məlumatları',
    cancel: 'İmtina',
    save: 'Yadda saxla',
    confirmDelete: 'Silinməni təsdiqləyin',
    confirmDeleteText: 'Bu məktəbi silmək istədiyinizə əminsiniz?',
    confirmButtonText: 'Bəli, sil',
    cancelButtonText: 'Xeyr, saxla',
    deleteWarning: 'Bu əməliyyat geri qaytarıla bilməz',
    errorOccurred: 'Xəta baş verdi',
    couldNotLoadSchools: 'Məktəblər yüklənə bilmədi',
    exportSuccess: 'Məktəblər uğurla ixrac edildi',
    exportError: 'İxrac zamanı xəta baş verdi',
    noSchoolsToExport: 'İxrac etmək üçün məktəb tapılmadı',
    language: 'Dil',
    assignAdmin: 'Admin təyin et',
    manageAdmin: 'Admini idarə et',
    selectUser: 'İstifadəçi seçin',
    searchUsers: 'İstifadəçiləri axtar...',
    adminAssigned: 'Admin uğurla təyin edildi',
    adminAssignmentFailed: 'Admin təyin edilərkən xəta baş verdi',
    schoolNotFound: 'Məktəb tapılmadı',
    noAdmin: 'Admin təyin edilməyib',
    adminIdMissing: 'Admin ID çatışmır',
    adminEmailWithoutId: 'Admin e-poçtu təyin edilib, lakin ID çatışmır. Admin yenidən təyin edin.'
  },
  en: {
    dashboard: 'Dashboard',
    schools: 'Schools',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    search: 'Search',
    schoolName: 'School Name',
    region: 'Region',
    sector: 'Sector',
    principal: 'Principal',
    status: 'Status',
    actions: 'Actions',
    addSchool: 'Add School',
    edit: 'Edit',
    delete: 'Delete',
    export: 'Export',
    refresh: 'Refresh',
    searchSchools: 'Search schools...',
    filterByRegion: 'Filter by Region',
    filterBySector: 'Filter by Sector',
    filterByStatus: 'Filter by Status',
    allRegions: 'All Regions',
    allSectors: 'All Sectors',
    allStatuses: 'All Statuses',
    active: 'Active',
    inactive: 'Inactive',
    blocked: 'Blocked',
    schoolsList: 'Schools List',
    schoolCreated: 'School created successfully',
    schoolUpdated: 'School updated successfully',
    schoolDeleted: 'School deleted successfully',
    schoolCreationFailed: 'Failed to create school',
    schoolUpdateFailed: 'Failed to update school',
    schoolDeletionFailed: 'Failed to delete school',
    schoolDetails: 'School Details',
    cancel: 'Cancel',
    save: 'Save',
    confirmDelete: 'Confirm Delete',
    confirmDeleteText: 'Are you sure you want to delete this school?',
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'No, keep it',
    deleteWarning: 'This action cannot be undone',
    errorOccurred: 'An error occurred',
    couldNotLoadSchools: 'Could not load schools',
    exportSuccess: 'Schools exported successfully',
    exportError: 'Error exporting schools',
    noSchoolsToExport: 'No schools to export',
    language: 'Language',
    assignAdmin: 'Assign Admin',
    manageAdmin: 'Manage Admin',
    selectUser: 'Select User',
    searchUsers: 'Search users...',
    adminAssigned: 'Admin assigned successfully',
    adminAssignmentFailed: 'Failed to assign admin',
    schoolNotFound: 'School not found',
    noAdmin: 'No admin assigned',
    adminIdMissing: 'Admin ID missing',
    adminEmailWithoutId: 'Admin email is set but ID is missing. Please reassign the admin.'
  },
  ru: {
    // ... ru translations will be here
    dashboard: 'Панель управления',
    schools: 'Школы',
    language: 'Язык'
  },
  tr: {
    // ... tr translations will be here
    dashboard: 'Yönetim Paneli',
    schools: 'Okullar',
    language: 'Dil'
  }
};

// Default translations key is used to inform user if translation is missing
const DEFAULT_TRANSLATIONS_KEY = 'en';

// Create the context with a default value
export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
  availableLanguages: availableLanguages
});

// Create the provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [storedLang, setStoredLang] = useLocalStorage<Language>('language', defaultLanguage);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(storedLang);

  // Update the stored language when the current language changes
  useEffect(() => {
    setStoredLang(currentLanguage);
  }, [currentLanguage, setStoredLang]);

  // Set the language
  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  // Get a translated value by key
  const t = (key: string, variables?: Record<string, string>): string => {
    const currentTranslations = translations[currentLanguage] || {};
    const defaultTranslations = translations[DEFAULT_TRANSLATIONS_KEY] || {};
    
    let value = currentTranslations[key] || defaultTranslations[key] || key;
    
    // Replace variables if provided
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        value = value.replace(new RegExp(`\\{${varKey}\\}`, 'g'), varValue);
      });
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  return context;
};

// Təhlükəsiz istifadə üçün əlavə edək
export const useLanguageSafe = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLanguage: defaultLanguage,
      setLanguage: () => {},
      t: (key: string) => key,
      availableLanguages: availableLanguages
    };
  }
  return context;
};
