// Status translation module - All status-related translations
export const status = {
  // General status labels
  status: 'Status',
  current_status: 'Mövcud status',
  status_changed: 'Status dəyişdirildi',
  status_updated: 'Status yeniləndi',
  
  // Approval statuses
  pending_approval: 'Təsdiq gözləyir',
  pending: 'Gözləyir',
  awaiting_approval: 'Təsdiq gözləyir',
  under_review: 'Baxılır',
  in_review: 'Nəzərdən keçirilir',
  approved: 'Təsdiqlənmiş',
  rejected: 'Rədd edilmiş',
  declined: 'İmtina edilmiş',
  needs_revision: 'Düzəliş tələb edir',
  returned: 'Qaytarılmış',
  
  // Form and data entry statuses  
  draft: 'Qaralama',
  saved_as_draft: 'Qaralama kimi saxlanıldı',
  submitted: 'Təqdim edilmiş',
  in_progress: 'Davam edir',
  completed: 'Tamamlanmış',
  finalized: 'Yekunlaşdırılmış',
  locked: 'Bloklanmış',
  unlocked: 'Blokdan çıxarılmış',
  
  // General activity statuses
  active: 'Aktiv',
  inactive: 'Qeyri-aktiv',
  enabled: 'Aktivləşdirilmiş',
  disabled: 'Deaktiv edilmiş',
  suspended: 'Dayandırılmış',
  archived: 'Arxivləşdirilmiş',
  deleted: 'Silinmiş',
  
  // Connection and system statuses
  online: 'Onlayn',
  offline: 'Offline',
  connected: 'Bağlı',
  disconnected: 'Bağlantısı kəsilmiş',
  synced: 'Sinxronizasiya edilmiş',
  syncing: 'Sinxronizasiya olunur',
  sync_failed: 'Sinxronizasiya uğursuz',
  
  // Deadline and time-related statuses
  due_soon: 'Son tarixə yaxın',
  due_today: 'Bu gün bitir',
  due_tomorrow: 'Sabah bitir',
  overdue: 'Vaxtı keçmiş',
  expired: 'Müddəti bitmiş',
  on_time: 'Vaxtında',
  early: 'Erkən',
  late: 'Gecikmiş',
  urgent: 'Təcili',
  
  // Priority levels
  priority: 'Prioritet',
  high_priority: 'Yüksək prioritet',
  medium_priority: 'Orta prioritet', 
  low_priority: 'Aşağı prioritet',
  critical: 'Kritik',
  important: 'Vacib',
  normal: 'Normal',
  
  // Progress indicators
  not_started: 'Başlanmayıb',
  starting: 'Başlayır',
  in_progress: 'Davam edir',
  nearly_complete: 'Demək olar tamamlanıb',
  almost_done: 'Az qalıb',
  complete: 'Tamam',
  finished: 'Bitdi',
  
  // Quality and validation statuses
  valid: 'Düzgün',
  invalid: 'Səhv',
  verified: 'Doğrulanmış',
  unverified: 'Doğrulanmamış',
  confirmed: 'Təsdiqlənmiş',
  unconfirmed: 'Təsdiqlənməmiş',
  
  // Availability statuses
  available: 'Mövcud',
  unavailable: 'Mövcud deyil',
  busy: 'Məşğul',
  free: 'Azad',
  occupied: 'Məşğul',
  vacant: 'Boş',
  
  // Operational statuses
  running: 'İşləyir',
  stopped: 'Dayandırılmış',
  paused: 'Fasilə',
  waiting: 'Gözləyir',
  queued: 'Növbədə',
  processing: 'İşlənir',
  
  // User statuses
  logged_in: 'Daxil olmuş',
  logged_out: 'Çıxmış',
  away: 'Uzaqda',
  present: 'Mövcud',
  absent: 'Yoxdur',
  
  // Content statuses
  published: 'Dərc edilmiş',
  unpublished: 'Dərc edilməmiş',
  hidden: 'Gizli',
  visible: 'Görünən',
  public: 'İctimai',
  private: 'Şəxsi',
  confidential: 'Məxfi',
  
  // Error and success statuses
  success: 'Uğurlu',
  failed: 'Uğursuz',
  error: 'Xəta',
  warning: 'Xəbərdarlıq',
  info: 'Məlumat',
  
  // School-specific statuses
  enrollment_open: 'Qeydiyyat açıq',
  enrollment_closed: 'Qeydiyyat bağlı',
  academic_year_active: 'Tədris ili aktiv',
  academic_year_ended: 'Tədris ili bitmiş',
  semester_active: 'Semestr aktiv',
  semester_ended: 'Semestr bitmiş',
  
  // Data entry specific statuses
  entry_required: 'Məlumat daxil edilməli',
  entry_optional: 'Məlumat isteğe bağlı',
  entry_complete: 'Məlumat daxil edilmiş',
  entry_incomplete: 'Məlumat natamam',
  entry_missing: 'Məlumat çatışmır',
  
  // Form validation statuses
  validation_passed: 'Doğrulama uğurlu',
  validation_failed: 'Doğrulama uğursuz',
  validation_pending: 'Doğrulama gözləyir',
  validation_required: 'Doğrulama tələb olunur',
  
  // File and document statuses
  uploaded: 'Yüklənmiş',
  downloading: 'Endirilir',
  downloaded: 'Endirilmiş',
  upload_failed: 'Yükləmə uğursuz',
  corrupted: 'Pozulmuş',
  virus_free: 'Virusdan təmiz',
  
  // Notification statuses
  read: 'Oxunmuş',
  unread: 'Oxunmamış',
  delivered: 'Çatdırılmış',
  sent: 'Göndərilmiş',
  failed_to_send: 'Göndərmə uğursuz',
  
  // Permission statuses
  authorized: 'İcazəli',
  unauthorized: 'İcazəsiz',
  access_granted: 'Giriş icazəsi verilmiş',
  access_denied: 'Giriş rədd edilmiş',
  permission_pending: 'İcazə gözləyir',
  
  // Backup and maintenance statuses
  backed_up: 'Ehtiyat nüsxəsi alınmış',
  backup_failed: 'Ehtiyat nüsxəsi uğursuz',
  maintenance_mode: 'Baxım rejimi',
  under_maintenance: 'Baxım altında',
  
  // Integration statuses
  integrated: 'İnteqrasiya edilmiş',
  not_integrated: 'İnteqrasiya edilməmiş',
  sync_error: 'Sinxronizasiya xətası',
  api_connected: 'API bağlı',
  api_disconnected: 'API bağlantısı kəsilmiş',
  
  // Status changes and transitions
  status_change: 'Status dəyişikliyi',
  status_history: 'Status tarixçəsi',
  previous_status: 'Əvvəlki status',
  new_status: 'Yeni status',
  status_reason: 'Status səbəbi',
  
  // Status descriptions
  status_description: 'Status təsviri',
  status_details: 'Status təfərrüatları',
  status_explanation: 'Status izahı',
  status_note: 'Status qeydi',
  
  // Time-based status indicators
  recently_updated: 'Bu yaxınlarda yenilənmiş',
  last_modified: 'Son dəyişiklik',
  created_today: 'Bu gün yaradılmış',
  modified_today: 'Bu gün dəyişdirilmiş',
  
  // Batch operation statuses
  batch_processing: 'Kütləvi işləmə',
  batch_complete: 'Kütləvi əməliyyat tamamlandı',
  batch_failed: 'Kütləvi əməliyyat uğursuz',
  partially_complete: 'Qismən tamamlanmış',
  
  // Conditional statuses
  conditional: 'Şərtli',
  unconditional: 'Şərtsiz',
  temporary: 'Müvəqqəti',
  permanent: 'Daimi',
  provisional: 'Müvəqqəti',
  
  // Quality assurance statuses
  reviewed: 'Nəzərdən keçirilmiş',
  not_reviewed: 'Nəzərdən keçirilməmiş',
  quality_checked: 'Keyfiyyət yoxlanılmış',
  needs_review: 'Nəzərdən keçirilməli',
  
  // Status indicators for UI
  status_indicator: 'Status göstəricisi',
  status_badge: 'Status nişanı',
  status_icon: 'Status ikonu',
  status_color: 'Status rəngi',
  
  // Common status combinations
  active_and_verified: 'Aktiv və doğrulanmış',
  pending_review: 'Nəzərdən keçirilmə gözləyir',
  approved_and_active: 'Təsdiqlənmiş və aktiv',
  completed_successfully: 'Uğurla tamamlanmış',
  failed_with_errors: 'Xətalarla uğursuz',
  
  // Status filtering and searching
  filter_by_status: 'Statusa görə filtr',
  all_statuses: 'Bütün statuslar',
  active_only: 'Yalnız aktiv',
  inactive_only: 'Yalnız qeyri-aktiv',
  completed_only: 'Yalnız tamamlanmış',
  pending_only: 'Yalnız gözləyən'
} as const;

export type Status = typeof status;
export default status;
