
// Dashboard translation module
export const dashboard = {
  title: 'İdarə Paneli',
  subtitle: 'Sistem məlumatlarına ümumi baxış',
  welcome: 'Xoş gəlmisiniz',
  loading: 'Yüklənir...',
  
  // Navigation
  navigation: {
    overview: 'Ümumi baxış',
    analytics: 'Analitika',
    reports: 'Hesabatlar',
    quick_actions: 'Tez əməliyyatlar',
    recent_activity: 'Son fəaliyyət',
    notifications: 'Bildirişlər',
    settings: 'Parametrlər'
  },

  // Main statistics
  stats: {
    // General numbers
    total_schools: 'Ümumi Məktəblər',
    total_students: 'Ümumi Şagirdlər',
    total_teachers: 'Ümumi Müəllimlər',
    total_users: 'Ümumi İstifadəçilər',
    active_users: 'Aktiv İstifadəçilər',
    online_users: 'Onlayn İstifadəçilər',
    total_regions: 'Ümumi Regionlar',
    
    // Region statistics
    region_schools: 'Region Məktəbləri',
    region_users: 'Region İstifadəçiləri',
    region_completion: 'Region Tamamlanma Faizi',
    
    // Sector statistics
    sector_schools: 'Sektor Məktəbləri',
    sector_completion: 'Sektor Tamamlanma Faizi',
    pending_approvals: 'Gözləyən Təsdiqlər',
    
    // School statistics
    pending_forms: 'Gözləyən Formlar',
    completed_forms: 'Tamamlanmış Formlar',
    form_completion: 'Form Tamamlanma Faizi',
    overdue_forms: 'Vaxtı keçən Formlar',
    total_forms: 'Ümumi Formlar',
    total_forms_description: 'Ümumi form sayı',
    due_soon: 'Tezliklə bitəcək',
    
    // Performance indicators
    completion_rate: 'Tamamlanma Faizi',
    approval_rate: 'Təsdiq Faizi',
    response_time: 'Cavab Vaxtı',
    user_engagement: 'İstifadəçi Fəallığı',
    data_quality: 'Məlumat Keyfiyyəti',
    system_uptime: 'Sistem İşləmə Vaxtı'
  },

  // SuperAdmin specific translations
  superadmin: {
    total_users: 'İstifadəçilər',
    total_schools: 'Məktəblər',
    total_regions: 'Regionlar',
    completion: 'Tamamlanma',
    system_users: 'Sistem istifadəçiləri',
    registered_schools: 'Qeydiyyatlı məktəblər',
    management_regions: 'İdarə regionları',
    average_completion: 'Ortalama tamamlanma',
    no_activity_yet: 'Hələ heç bir fəaliyyət yoxdur'
  },

  // Cards and widgets
  cards: {
    overview: 'Ümumi Baxış',
    quick_stats: 'Tez Statistika',
    completion_progress: 'Tamamlanma Proqresi',
    pending_tasks: 'Gözləyən Tapşırıqlar',
    recent_activity: 'Son Fəaliyyət',
    notifications: 'Bildirişlər',
    deadlines: 'Son Tarixlər',
    performance: 'Performans',
    alerts: 'Xəbərdarlıqlar',
    system_status: 'Sistem Statusu'
  },

  // Progress indicators
  progress: {
    data_entry: 'Məlumat Daxil Etmə',
    form_completion: 'Form Tamamlanması',
    approval_process: 'Təsdiq Prosesi',
    quality_check: 'Keyfiyyət Yoxlaması',
    deadline_tracking: 'Son Tarix İzləmə',
    overall_progress: 'Ümumi Proqres',
    
    // Progress statuses
    not_started: 'Başlanmayıb',
    in_progress: 'Davam edir',
    nearly_complete: 'Demək olar ki, tamam',
    completed: 'Tamamlandı',
    overdue: 'Vaxtı keçib',
    needs_attention: 'Diqqət tələb edir'
  },

  // Recent activity
  activity: {
    recent_logins: 'Son Girişlər',
    recent_submissions: 'Son Təqdimatlar',
    recent_approvals: 'Son Təsdiqlər',
    recent_changes: 'Son Dəyişikliklər',
    recent_uploads: 'Son Yükləmələr',
    system_events: 'Sistem Hadisələri',
    user_actions: 'İstifadəçi Hərəkətləri',
    no_activity: 'Fəaliyyət yoxdur',
    loading_activity: 'Fəaliyyət yüklənir...',
    
    // Activity types
    login: 'Giriş',
    logout: 'Çıxış',
    created: 'Yaradıldı',
    updated: 'Yeniləndi',
    deleted: 'Silindi',
    approved: 'Təsdiqləndi',
    rejected: 'Rədd edildi',
    submitted: 'Təqdim edildi',
    uploaded: 'Yükləndi',
    downloaded: 'Endirildi'
  },

  // Notifications
  notifications: {
    title: 'Bildirişlər',
    new_notifications: 'Yeni Bildirişlər',
    no_notifications: 'Bildiriş yoxdur',
    mark_all_read: 'Hamısını oxunmuş kimi işarələ',
    clear_all: 'Hamısını təmizlə',
    view_all: 'Hamısına bax'
  },

  // Filters and search
  filters: {
    filter_by_date: 'Tarixə görə filtr',
    filter_by_status: 'Statusa görə filtr',
    filter_by_region: 'Regiona görə filtr',
    filter_by_sector: 'Sektora görə filtr',
    filter_by_school: 'Məktəbə görə filtr',
    filter_by_user: 'İstifadəçiyə görə filtr',
    search_dashboard: 'Dashboard-da axtar',
    clear_filters: 'Filtrləri təmizlə',
    apply_filters: 'Filtrləri tətbiq et'
  },

  // Refresh and sync
  refresh: {
    refresh_data: 'Məlumatları Yenilə',
    auto_refresh: 'Avtomatik Yenilənmə',
    last_updated: 'Son yenilənmə',
    refreshing: 'Yenilənir...',
    sync_status: 'Sinxronizasiya statusu',
    sync_in_progress: 'Sinxronizasiya davam edir',
    sync_completed: 'Sinxronizasiya tamamlandı',
    sync_failed: 'Sinxronizasiya uğursuz'
  },

  // Time selection
  time_period: {
    today: 'Bu gün',
    yesterday: 'Dünən',
    this_week: 'Bu həftə',
    last_week: 'Keçən həftə',
    this_month: 'Bu ay',
    last_month: 'Keçən ay',
    this_quarter: 'Bu rüb',
    last_quarter: 'Keçən rüb',
    this_year: 'Bu il',
    last_year: 'Keçən il',
    custom_range: 'Xüsusi aralıq',
    select_period: 'Dövr seçin'
  },

  // Form statistics
  formStatistics: 'Form Statistikaları',
  recentActivity: 'Son Fəaliyyət',

  // States
  states: {
    loading: 'Yüklənir...',
    error: 'Xəta baş verdi',
    no_data: 'Məlumat yoxdur',
    connection_error: 'Bağlantı xətası',
    timeout: 'Vaxt bitdi',
    retry: 'Yenidən cəhd et',
    reload: 'Yenidən yüklə'
  }
} as const;

export type Dashboard = typeof dashboard;
export default dashboard;
