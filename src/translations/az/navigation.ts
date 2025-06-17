// Navigation translation module - All navigation related translations
export const navigation = {
  // Main navigation items
  dashboard: 'İdarə paneli',
  regions: 'Regionlar',
  sectors: 'Sektorlar', 
  schools: 'Məktəblər',
  categories: 'Kateqoriyalar',
  columns: 'Sütunlar',
  users: 'İstifadəçilər',
  performance: 'Performans',
  userManagement: 'İstifadəçi İdarəetməsi',
  dataEntry: 'Məlumat daxil etmə',
  sectorDataEntry: 'Sektor məlumat daxil etmə',
  approvals: 'Təsdiq gözləyənlər',
  reports: 'Hesabatlar',
  settings: 'Parametrlər',
  statistics: 'Statistika',
  progress: 'Proqres izləmə',
  
  // Page titles and headers
  manage_data_columns: 'Sütunları İdarə Et',
  system_settings: 'Sistem Parametrləri',
  user_profile: 'İstifadəçi Profili',
  
  // Navigation actions
  home: 'Ana səhifə',
  back: 'Geri',
  logout: 'Çıxış',
  profile: 'Profil',
  
  // Breadcrumb navigation
  breadcrumb: {
    home: 'Ana səhifə',
    dashboard: 'İdarə paneli',
    settings: 'Parametrlər',
    profile: 'Profil',
    users: 'İstifadəçilər',
    schools: 'Məktəblər'
  },
  
  // Menu categories
  main_menu: 'Əsas Menyu',
  administration: 'Administrasiya',
  data_management: 'Məlumat İdarəetməsi',
  system: 'Sistem',
  help: 'Kömək'
} as const;

export type Navigation = typeof navigation;
export default navigation;
