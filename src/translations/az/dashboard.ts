// Dashboard translation module
export const dashboard = {
  title: 'İdarə Paneli',
  subtitle: 'Sistem məlumatlarına ümumi baxış',
  welcome: 'Xoş gəlmisiniz',
  
  // Naviqasiya
  navigation: {
    overview: 'Ümumi baxış',
    analytics: 'Analitika',
    reports: 'Hesabatlar',
    quick_actions: 'Tez əməliyyatlar',
    recent_activity: 'Son fəaliyyət',
    notifications: 'Bildirişlər',
    settings: 'Parametrlər'
  },

  // Əsas statistikalar
  stats: {
    // Ümumi rəqəmlər
    total_schools: 'Ümumi Məktəblər',
    total_students: 'Ümumi Şagirdlər',
    total_teachers: 'Ümumi Müəllimlər',
    total_users: 'Ümumi İstifadəçilər',
    active_users: 'Aktiv İstifadəçilər',
    online_users: 'Onlayn İstifadəçilər',
    
    // Region statistikaları
    region_schools: 'Region Məktəbləri',
    region_users: 'Region İstifadəçiləri',
    region_completion: 'Region Tamamlanma Faizi',
    
    // Sektor statistikaları
    sector_schools: 'Sektor Məktəbləri',
    sector_completion: 'Sektor Tamamlanma Faizi',
    pending_approvals: 'Gözləyən Təsdiqlər',
    
    // Məktəb statistikaları
    pending_forms: 'Gözləyən Formlar',
    completed_forms: 'Tamamlanmış Formlar',
    form_completion: 'Form Tamamlanma Faizi',
    overdue_forms: 'Vaxtı keçən Formlar',
    total_forms: 'Ümumi Formlar',
    total_forms_description: 'Ümumi form sayı',
    
    // Performans göstəriciləri
    completion_rate: 'Tamamlanma Faizi',
    approval_rate: 'Təsdiq Faizi',
    response_time: 'Cavab Vaxtı',
    user_engagement: 'İstifadəçi Fəallığı',
    data_quality: 'Məlumat Keyfiyyəti',
    system_uptime: 'Sistem İşləmə Vaxtı'
  },

  // Kartlar və widgetlər
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

  // Proqres göstəriciləri
  progress: {
    data_entry: 'Məlumat Daxil Etmə',
    form_completion: 'Form Tamamlanması',
    approval_process: 'Təsdiq Prosesi',
    quality_check: 'Keyfiyyət Yoxlaması',
    deadline_tracking: 'Son Tarix İzləmə',
    overall_progress: 'Ümumi Proqres',
    
    // Proqres statusları
    not_started: 'Başlanmayıb',
    in_progress: 'Davam edir',
    nearly_complete: 'Demək olar ki, tamam',
    completed: 'Tamamlandı',
    overdue: 'Vaxtı keçib',
    needs_attention: 'Diqqət tələb edir'
  },

  // Son fəaliyyət
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
    
    // Fəaliyyət növləri
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

  // Bildirişlər
  notifications: {
    title: 'Bildirişlər',
    new_notifications: 'Yeni Bildirişlər',
    no_notifications: 'Bildiriş yoxdur',
    mark_all_read: 'Hamısını oxunmuş kimi işarələ',
    clear_all: 'Hamısını təmizlə',
    view_all: 'Hamısına bax',
    
    // Bildiriş növləri
    info: 'Məlumat',
    warning: 'Xəbərdarlıq',
    error: 'Xəta',
    success: 'Uğur',
    reminder: 'Xatırlatma',
    deadline: 'Son tarix',
    approval: 'Təsdiq',
    system: 'Sistem',
    
    // Bildiriş mesajları
    form_submitted: 'Form təqdim edildi',
    approval_required: 'Təsdiq tələb olunur',
    deadline_approaching: 'Son tarix yaxınlaşır',
    deadline_passed: 'Son tarix keçdi',
    data_updated: 'Məlumatlar yeniləndi',
    new_message: 'Yeni mesaj',
    system_maintenance: 'Sistem baxımı',
    backup_completed: 'Ehtiyat nüsxəsi tamamlandı'
  },

  // Son tarixlər
  deadlines: {
    upcoming_deadlines: 'Yaxınlaşan Son Tarixlər',
    overdue_items: 'Vaxtı Keçən Elementlər',
    no_deadlines: 'Son tarix yoxdur',
    days_left: 'gün qalıb',
    hours_left: 'saat qalıb',
    overdue_by: 'vaxtı keçib',
    
    // Prioritet səviyyələri
    critical: 'Kritik',
    high: 'Yüksək',
    medium: 'Orta',
    low: 'Aşağı',
    
    // Tarix formatları
    today: 'Bu gün',
    tomorrow: 'Sabah',
    this_week: 'Bu həftə',
    next_week: 'Gələn həftə',
    this_month: 'Bu ay',
    overdue: 'Vaxtı keçib'
  },

  // Tez əməliyyatlar
  quick_actions: {
    title: 'Tez Əməliyyatlar',
    create_user: 'İstifadəçi Yarat',
    add_school: 'Məktəb Əlavə Et',
    new_category: 'Yeni Kateqoriya',
    generate_report: 'Hesabat Yarat',
    export_data: 'Məlumatları İxrac Et',
    import_data: 'Məlumat İdxal Et',
    send_notification: 'Bildiriş Göndər',
    backup_system: 'Sistem Ehtiyat Nüsxəsi',
    view_logs: 'Jurналlara Bax',
    system_settings: 'Sistem Parametrləri'
  },

  // Filtrlər və axtarış
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

  // Yenilənmə və sinxronizasiya
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

  // Vaxt seçimi
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

  // Eksport və hesabatlar
  export: {
    export_dashboard: 'Dashboard-u İxrac Et',
    export_pdf: 'PDF kimi ixrac et',
    export_excel: 'Excel kimi ixrac et',
    export_csv: 'CSV kimi ixrac et',
    generate_report: 'Hesabat Yarat',
    schedule_report: 'Hesabatı Planlaşdır',
    email_report: 'Hesabatı Email Et',
    print_dashboard: 'Dashboard-u Çap Et'
  },

  // Rol-əsaslı mesajlar
  role_specific: {
    superadmin: {
      welcome: 'Super Admin olaraq xoş gəlmisiniz',
      total_system_overview: 'Bütün sistemə ümumi baxış',
      manage_all: 'Bütün məlumatları idarə edin'
    },
    regionadmin: {
      welcome: 'Region Admini olaraq xoş gəlmisiniz',
      region_overview: 'Region məlumatlarına baxış',
      manage_region: 'Region məlumatlarını idarə edin'
    },
    sectoradmin: {
      welcome: 'Sektor Admini olaraq xoş gəlmisiniz',
      sector_overview: 'Sektor məlumatlarına baxış',
      manage_sector: 'Sektor məlumatlarını idarə edin'
    },
    schooladmin: {
      welcome: 'Məktəb Admini olaraq xoş gəlmisiniz',
      school_overview: 'Məktəb məlumatlarına baxış',
      manage_school: 'Məktəb məlumatlarını idarə edin'
    }
  },

  // Səhv və yükləmə statusları
  states: {
    loading: 'Yüklənir...',
    error: 'Xəta baş verdi',
    no_data: 'Məlumat yoxdur',
    connection_error: 'Bağlantı xətası',
    timeout: 'Vaxt bitdi',
    retry: 'Yenidən cəhd et',
    reload: 'Yenidən yüklə'
  },

  // Məlumat tooltipləri
  tooltips: {
    completion_rate: 'Tamamlanmış formların ümumi forma görə faizi',
    approval_rate: 'Təsdiqlənmiş təqdimatların ümumi təqdimata görə faizi',
    response_time: 'Orta cavab vaxtı',
    user_engagement: 'Aktiv istifadəçilərin faizi',
    data_quality: 'Məlumatların düzgünlük faizi',
    click_for_details: 'Təfərrüatlar üçün klikləyin',
    hover_for_info: 'Məlumat üçün üzərinə gəlin'
  }
} as const;

export type Dashboard = typeof dashboard;
export default dashboard;