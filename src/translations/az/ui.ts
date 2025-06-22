
// UI translation module - User Interface elements
export const ui = {
  // Actions
  save: 'Saxla',
  cancel: 'İmtina',
  delete: 'Sil',
  edit: 'Redaktə et',
  create: 'Yarat',
  add: 'Əlavə et',
  remove: 'Sil',
  update: 'Yenilə',
  submit: 'Təqdim et',
  confirm: 'Təsdiq et',
  close: 'Bağla',
  ok: 'Tamam',
  yes: 'Bəli',
  no: 'Xeyr',
  upload: 'Yüklə',
  download: 'Endir',
  export: 'İxrac et',
  import: 'İdxal et',
  refresh: 'Yenilə',
  reset: 'Sıfırla',
  clear: 'Təmizlə',
  search: 'Axtar',
  filter: 'Filtr',
  sort: 'Sırala',
  
  // Navigation
  next: 'Sonra',
  previous: 'Əvvəl',
  back: 'Geri',
  forward: 'İrəli',
  home: 'Ana səhifə',
  
  // Status
  loading: 'Yüklənir...',
  success: 'Uğurlu',
  error: 'Xəta',
  warning: 'Xəbərdarlıq',
  info: 'Məlumat',
  
  // Common phrases
  please_wait: 'Zəhmət olmasa gözləyin',
  try_again: 'Yenidən cəhd edin',
  something_went_wrong: 'Nəsə səhv getdi',
  no_data: 'Məlumat yoxdur',
  not_found: 'Tapılmadı',
  access_denied: 'Giriş qadağandır',
  unauthorized: 'İcazəsiz',
  
  // Form elements
  required: 'Mütləq',
  optional: 'İxtiyari',
  placeholder: 'Daxil edin...',
  select_option: 'Seçim edin',
  choose_file: 'Fayl seçin',
  
  // Dialog
  dialog_title: 'Dialoq',
  confirm_action: 'Əməliyyatı təsdiq edin',
  are_you_sure: 'Əminsiniz?',
  
  // Language
  language: 'Dil',
  change_language: 'Dili dəyişdir',
  
  // Theme
  theme: 'Tema',
  light_mode: 'İşıqlı rejim',
  dark_mode: 'Qaranlıq rejim',
  
  // Time
  date: 'Tarix',
  time: 'Vaxt',
  today: 'Bu gün',
  yesterday: 'Dünən',
  tomorrow: 'Sabah',
  
  // Pagination
  page: 'Səhifə',
  of: 'dən',
  total: 'Ümumi',
  show: 'Göstər',
  per_page: 'səhifə başına',
  
  // Validation
  invalid: 'Düzgün deyil',
  valid: 'Düzgün',
  required_field: 'Bu sahə mütləqdir',
  
  // Progress
  progress: 'İrəliləyiş',
  completed: 'Tamamlandı',
  in_progress: 'Davam edir',
  pending: 'Gözləyir',
  
  // Approval və Status
  approve: 'Təsdiq et',
  reject: 'Rədd et',
  approved: 'Təsdiqlənmiş',
  rejected: 'Rədd edilmiş',
  draft: 'Hazırlanır',
  
  // Filters
  filters: 'Filtrlər',
  all_regions: 'Bütün regionlar',
  all_sectors: 'Bütün sektorlar',
  all_statuses: 'Bütün statuslar',
  all_categories: 'Bütün kateqoriyalar',
  apply_filters: 'Filtrləri tətbiq et',
  clear_filters: 'Filtrləri təmizlə',
  
  // Selection
  select_all: 'Hamısını seç',
  select_none: 'Seçimi ləğv et',
  selected: 'seçildi',
  
  // Table və Pagination
  showing_entries: 'Göstərilir {{start}} - {{end}} cəmi {{total}}',
  no_results: 'Nəticə tapılmadı',
  empty_state: 'Bu statusda məlumat yoxdur',
  
  // Common Actions
  view_details: 'Ətraflı bax',
  assign_admin: 'Admin təyin et',
  completion_rate: 'Tamamlanma faizi'
} as const;

export type UI = typeof ui;
export default ui;
