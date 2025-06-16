// Navigation translation module - İyileşdirilmiş versiya
export const navigation = {
  // Əsas naviqasiya elementləri
  dashboard: 'İdarə paneli',
  regions: 'Regionlar',
  sectors: 'Sektorlar',
  schools: 'Məktəblər',
  categories: 'Kateqoriyalar',
  columns: 'Sütunlar',
  users: 'İstifadəçilər',
  reports: 'Hesabatlar',
  settings: 'Parametrlər',
  dataEntry: 'Məlumat daxil etmə',
  approvals: 'Təsdiq gözləyənlər',
  profile: 'Profil',
  logout: 'Çıxış',
  statistics: 'Statistika',
  sectorDataEntry: 'Sektor Məlumatları',
  progress: 'Proqres İzləmə',
  performance: 'Performans',
  userManagement: 'İstifadəçi İdarəetməsi',
  auth: 'İdentifikasiya',
  
  // Naviqasiya hərəkətləri
  help: 'Kömək',
  notifications: 'Bildirişlər',
  menu: 'Menyu',
  open_menu: 'Menyunu aç',
  close_menu: 'Menyunu bağla',
  back: 'Geri',
  forward: 'İrəli',
  home: 'Ana səhifə',
  
  // Tətbiq adı və branding
  app_name: 'İnfoLine',
  app_description: 'Məktəb Məlumatları Toplama Sistemi',
  
  // Səhifə başlıqları
  page_titles: {
    dashboard: 'İdarə Paneli',
    regions: 'Region İdarəetməsi',
    sectors: 'Sektor İdarəetməsi',
    schools: 'Məktəb İdarəetməsi',
    categories: 'Kateqoriya İdarəetməsi',
    columns: 'Sütun İdarəetməsi',
    users: 'İstifadəçi İdarəetməsi',
    reports: 'Hesabatlar',
    settings: 'Sistem Parametrləri',
    dataEntry: 'Məlumat Daxil Etmə',
    approvals: 'Təsdiq İdarəetməsi',
    profile: 'İstifadəçi Profili',
    statistics: 'Statistika və Analitika',
    performance: 'Sistem Performansı'
  },
  
  // Breadcrumb və yol göstərici mətnlər
  breadcrumb: {
    home: 'Ana səhifə',
    back_to: 'Geri qayıt',
    current_page: 'Cari səhifə',
    separator: '/',
    you_are_here: 'Siz buradasınız'
  },
  
  // Sidebar və menyu statusları
  sidebar: {
    expand: 'Genişləndir',
    collapse: 'Yığışdır',
    toggle: 'Dəyişdir',
    minimized: 'Kiçildilmiş',
    expanded: 'Genişləndirilmiş'
  },
  
  // Mobil naviqasiya
  mobile: {
    menu: 'Menyu',
    close: 'Bağla',
    navigation: 'Naviqasiya',
    main_menu: 'Əsas menyu'
  },
  
  // Accessibility mətnləri
  accessibility: {
    main_navigation: 'Əsas naviqasiya',
    skip_to_content: 'Məzmuna keç',
    skip_to_navigation: 'Naviqasiyaya keç',
    current_page: 'Cari səhifə',
    external_link: 'Xarici keçid',
    new_window: 'Yeni pəncərədə açılır'
  }
} as const;

export type Navigation = typeof navigation;
export default navigation;