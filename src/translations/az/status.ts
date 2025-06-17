
// Status translation module - Status and state related translations
export const status = {
  // Basic statuses
  active: 'Aktiv',
  inactive: 'Qeyri-aktiv',
  pending: 'Gözləyir',
  pending_approval: 'Təsdiq gözləyir',
  approved: 'Təsdiqləndi',
  rejected: 'Rədd edildi',
  cancelled: 'Ləğv edildi',
  completed: 'Tamamlandı',
  draft: 'Layihə',
  
  // Form statuses
  submitted: 'Təqdim edildi',
  under_review: 'Baxılır',
  returned: 'Geri qaytarıldı',
  archived: 'Arxivləndi',
  
  // Time-based statuses
  overdue: 'Vaxtı keçdi',
  due_soon: 'Tezliklə bitəcək',
  on_time: 'Vaxtında',
  early: 'Erkən',
  late: 'Gec',
  
  // Quality statuses
  valid: 'Düzgün',
  invalid: 'Səhv',
  verified: 'Təsdiqlənmiş',
  unverified: 'Təsdiqlənməmiş',
  
  // System statuses
  online: 'Onlayn',
  offline: 'Offline',
  connected: 'Bağlı',
  disconnected: 'Bağlantı kəsildi',
  synced: 'Sinxronlaşdı',
  syncing: 'Sinxronlaşır',
  
  // Progress statuses
  not_started: 'Başlanmayıb',
  in_progress: 'Davam edir',
  nearly_complete: 'Demək olar ki, tamam',
  
  // Error statuses
  error: 'Xəta',
  warning: 'Xəbərdarlıq',
  success: 'Uğur',
  info: 'Məlumat'
} as const;

export type Status = typeof status;
export default status;
