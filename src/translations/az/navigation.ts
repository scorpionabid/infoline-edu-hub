
// Navigation translation module
export const navigation = {
  // Main navigation
  dashboard: 'İdarə Paneli',
  dataEntry: 'Məlumat Daxil Etmə',
  categories: 'Kateqoriyalar',
  columns: 'Sütunlar',
  users: 'İstifadəçilər',
  schools: 'Məktəblər',
  sectors: 'Sektorlar',
  regions: 'Regionlar',
  reports: 'Hesabatlar',
  statistics: 'Statistika',
  settings: 'Parametrlər',
  profile: 'Profil',
  notifications: 'Bildirişlər',
  
  // Breadcrumb navigation
  home: 'Ana səhifə',
  back: 'Geri',
  
  // Menu items
  menu: 'Menyu',
  close_menu: 'Menyunu bağla',
  open_menu: 'Menyunu aç'
} as const;

export type Navigation = typeof navigation;
export default navigation;
