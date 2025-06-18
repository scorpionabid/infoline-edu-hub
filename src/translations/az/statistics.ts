// Statistics translation module
export const statistics = {
  // General
  title: 'Statistika',
  description: 'Sistem statistikası və performans metrikaları',
  
  // Loading and Errors
  loading: 'Yüklənir...',
  errorLoading: 'Statistika yüklənərkən xəta baş verdi',
  noData: 'Statistika məlumatları mövcud deyil',
  lastUpdated: 'Son yenilənmə',
  
  // Stats Cards
  totalSchools: 'Toplam Məktəblər',
  totalUsers: 'Toplam İstifadəçilər',
  totalRegions: 'Toplam Regionlar',
  totalSectors: 'Toplam Sektorlar',
  totalForms: 'Ümumi formlar',
  activeForms: 'Aktiv Formlar',
  totalSubmissions: 'Toplam təqdimatlar',
  
  // Metrics
  completionRate: 'Tamamlanma dərəcəsi',
  approvalRate: 'Təsdiq dərəcəsi',
  pendingApprovals: 'Gözləyən Təsdiqlər',
  needsReview: 'Nəzərdən keçirilməlidir',
  
  // Performance
  performanceMetrics: 'Performans Metriklər',
  aboveAverage: 'Ortalamadan yuxarı',
  belowAverage: 'Ortalamadan aşağı',
  
  // Time periods
  today: 'Bu gün',
  thisWeek: 'Bu həftə',
  thisMonth: 'Bu ay',
  last30Days: 'Son 30 gün',
  thisYear: 'Bu il',
  
  // Charts
  usersByRole: 'İstifadəçilər rola görə',
  submissionsByDay: 'Gündəlik təqdimatlar',
  completionByCategory: 'Kateqoriya üzrə tamamlanma',
  
  // Tables
  topRegions: 'Ən çox iştirak edən regionlar',
  topSectors: 'Ən çox iştirak edən sektorlar',
  topSchools: 'Ən çox iştirak edən məktəblər',
  
  // Actions
  exportData: 'Məlumatları ixrac et',
  refresh: 'Yenilə',
  filter: 'Filtr',
  clearFilters: 'Filtrləri təmizlə',
  
  // Status
  active: 'Aktiv',
  inactive: 'Qeyri-aktiv',
  pending: 'Gözləyir',
  completed: 'Tamamlandı',
  approved: 'Təsdiqləndi',
  rejected: 'Rədd edildi',
  
  // Messages
  noDataAvailable: 'Mövcud məlumat yoxdur',
  loadingData: 'Məlumatlar yüklənir...',
  errorFetchingData: 'Məlumatlar alınarkən xəta baş verdi',
  tryAgain: 'Yenidən cəhd edin',
  
  // Common
  all: 'Hamısı',
  select: 'Seçin',
  selected: 'seçilib',
  actions: 'Əməliyyatlar',
  viewDetails: 'Detallara bax',
  close: 'Bağla',
  back: 'Geri',
  next: 'Növbəti',
  previous: 'Əvvəlki'
} as const;

export type Statistics = typeof statistics;
export default statistics;
