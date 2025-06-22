// Approval translation module - Təsdiq prosesi üçün tərcümələr
export const approval = {
  // Page titles
  title: 'Təsdiq Meneceri',
  subtitle: 'Məktəb məlumatlarını nəzərdən keçirin və təsdiq edin',
  page_title: 'Təsdiq Prosesi',
  
  // Tab labels
  pending_tab: 'Gözləyən ({{count}})',
  approved_tab: 'Təsdiqlənmiş ({{count}})',
  rejected_tab: 'Rədd edilmiş ({{count}})',
  draft_tab: 'Hazırlanır ({{count}})',
  
  // Action buttons
  approve_item: 'Təsdiq et',
  reject_item: 'Rədd et',
  view_details: 'Ətraflı bax',
  bulk_approve: 'Toplu təsdiq',
  bulk_reject: 'Toplu rədd',
  
  // Dialogs
  bulk_dialog_title_approve: 'Toplu Təsdiq',
  bulk_dialog_title_reject: 'Toplu Rədd',
  reject_dialog_title: 'Məlumatı Rədd Et',
  
  // Form labels
  rejection_reason_label: 'Rədd səbəbi *',
  rejection_reason_placeholder: 'Rədd səbəbini daxil edin...',
  additional_comment_label: 'Əlavə şərh (istəyə bağlı)',
  additional_comment_placeholder: 'Əlavə şərh...',
  
  // Alerts və warnings
  bulk_operation_warning: 'Bu əməliyyat {{count}} elementə tətbiq ediləcək və geri alına bilməz.',
  rejection_warning: 'Bu əməliyyat geri alına bilməz. Məktəb admininə rədd səbəbi göndəriləcək.',
  
  // Status badges
  status_pending: 'Gözləyir',
  status_approved: 'Təsdiqləndi',
  status_rejected: 'Rədd edildi',
  status_draft: 'Hazırlanır',
  status_unknown: 'Naməlum',
  
  // Item descriptions
  item_school_name: 'Məktəb: {{name}}',
  item_category: 'Kateqoriya: {{category}}',
  item_completion: '{{rate}}% tamamlandı',
  item_submitted: 'Göndərildi: {{date}}',
  
  // Selection
  items_selected: '{{count}} element seçildi',
  select_all_items: 'Bütün elementləri seç',
  clear_selection: 'Seçimi ləğv et',
  
  // Empty states
  no_items_found: 'Heç bir element tapılmadı',
  no_pending_items: 'Təsdiq gözləyən məlumat yoxdur',
  no_approved_items: 'Təsdiqlənmiş məlumat yoxdur',
  no_rejected_items: 'Rədd edilmiş məlumat yoxdur',
  no_draft_items: 'Hazırlanmaqda olan məlumat yoxdur',
  empty_state_message: 'Bu statusda məlumat yoxdur',
  
  // Search və filter
  search_placeholder: 'Məktəb və ya kateqoriya axtar...',
  filter_reset: 'Filtri sıfırla',
  refresh_data: 'Yenilə',
  
  // Stats cards
  stats_total: 'Ümumi',
  stats_pending: 'Gözləyən',
  stats_approved: 'Təsdiqlənmiş',
  stats_rejected: 'Rədd edilmiş',
  stats_draft: 'Hazırlanır',
  
  // Success messages
  approve_success: 'Məlumat uğurla təsdiqləndi',
  reject_success: 'Məlumat uğurla rədd edildi',
  bulk_approve_success: 'Seçilmiş məlumatlar uğurla təsdiqləndi',
  bulk_reject_success: 'Seçilmiş məlumatlar uğurla rədd edildi',
  
  // Error messages
  approve_error: 'Təsdiq zamanı xəta: {{error}}',
  reject_error: 'Rədd zamanı xəta: {{error}}',
  load_error: 'Məlumatlar yüklənərkən xəta baş verdi',
  
  // Loading states
  loading_data: 'Məlumatlar yüklənir...',
  processing_approval: 'Təsdiq edilir...',
  processing_rejection: 'Rədd edilir...',
  processing_bulk: 'Toplu əməliyyat həyata keçirilir...',
  
  // Tooltips
  tooltip_view: 'Ətraflı bax',
  tooltip_approve: 'Bu məlumatı təsdiq et',
  tooltip_reject: 'Bu məlumatı rədd et',
  tooltip_refresh: 'Məlumatları yenilə',
  tooltip_filter: 'Filtri sıfırla',
  
  // Context descriptions
  school_data_context: '{{schoolName}} məktəbinin {{categoryName}} kateqoriyası üzrə məlumatları'
} as const;

export type Approval = typeof approval;
export default approval;
