
// Data Management translation module
export const dataManagement = {
  // Page titles
  title: 'Data İdarəetməsi',
  subtitle: 'Məktəb məlumatlarını idarə edin, təsdiq edin və ya rədd edin',
  
  // Steps
  step_category: 'Kateqoriya',
  step_column: 'Sütun', 
  step_data: 'Məlumat',
  
  // Category selection
  category_selection_title: 'Kateqoriya Seçimi',
  category_selection_subtitle: 'Məlumat daxil etmək və ya idarə etmək istədiyiniz kateqoriyanı seçin',
  categories_loading: 'Kateqoriyalar yüklənir...',
  no_categories: 'Kateqoriya tapılmadı',
  no_categories_description: 'Sizin rolunuz üçün əlçatan kateqoriya yoxdur',
  
  // Column selection
  column_selection_title: 'Sütun Seçimi',
  column_selection_subtitle: 'kateqoriyası üçün sütun seçin',
  columns_loading: 'Sütunlar yüklənir...',
  no_columns: 'Sütun tapılmadı',
  no_columns_description: 'Bu kateqoriya üçün heç bir sütun tapılmadı',
  
  // School data grid
  school_data_title: 'Məktəb Məlumatları',
  school_data_subtitle: 'sütunu üçün məlumatları idarə edin',
  school_data_loading: 'Məktəb məlumatları yüklənir...',
  no_school_data: 'Məktəb tapılmadı',
  no_school_data_description: 'Bu sütun üçün heç bir məktəb məlumatı tapılmadı',
  
  // Actions
  back: 'Geri',
  back_to_start: 'Başa qayıt',
  refresh: 'Yenilə',
  save: 'Saxla',
  save_all: 'Hamısını Saxla',
  approve: 'Təsdiqlə',
  reject: 'Rədd et',
  approve_all: 'Hamısını Təsdiqlə',
  reject_all: 'Hamısını Rədd Et',
  export: 'İxrac Et',
  
  // Filters
  search_placeholder: 'Məktəb axtar...',
  filter_all: 'Bütün statuslar',
  filter_empty: 'Boş',
  filter_pending: 'Gözləyən',
  filter_approved: 'Təsdiqlənmiş',
  filter_rejected: 'Rədd edilmiş',
  clear_filters: 'Filtirləri sıfırla',
  
  // Status badges
  status_empty: 'Boş',
  status_pending: 'Gözləyir',
  status_approved: 'Təsdiqlənmiş',
  status_rejected: 'Rədd edilmiş',
  
  // Data entry
  current_value: 'Mövcud Dəyər',
  new_value: 'Yeni Dəyər',
  enter_data_placeholder: 'Məlumatı daxil edin...',
  select_option: 'Seçim edin...',
  required_field: 'Məcburi',
  optional_field: 'İxtiyari',
  
  // Bulk operations
  schools_selected: 'məktəb seçilib',
  bulk_approve_confirm: 'məktəbin məlumatını təsdiqləmək istəyirsiniz?',
  bulk_reject_title: 'Toplu Rədd Etmə',
  bulk_reject_description: 'məktəbin məlumatını rədd etmək istəyirsiniz. Rədd etmə səbəbini qeyd edin.',
  reject_reason_label: 'Rədd Səbəbi',
  reject_reason_placeholder: 'Məlumatların rədd edilmə səbəbini qeyd edin...',
  reject_reason_required: 'Rədd səbəbi daxil edilməlidir',
  
  // Messages - Enhanced for column-level operations
  data_saved: 'Məlumat uğurla saxlanıldı',
  data_approved: 'Sütun məlumatı təsdiqləndi',
  data_rejected: 'Sütun məlumatı rədd edildi',
  bulk_approved: 'sütun məlumatı təsdiqləndi',
  bulk_rejected: 'sütun məlumatı rədd edildi',
  save_error: 'Məlumat saxlanarkən xəta baş verdi',
  approval_error: 'Təsdiq zamanı xəta baş verdi',
  rejection_error: 'Rədd zamanı xəta baş verdi',
  bulk_approval_error: 'Toplu təsdiq zamanı xəta baş verdi',
  bulk_rejection_error: 'Toplu rədd zamanı xəta baş verdi',
  
  // Column-level approval messages
  column_approval_success: 'sütunu üçün məlumat təsdiqləndi',
  column_rejection_success: 'sütunu üçün məlumat rədd edildi',
  column_approval_info: 'Yalnız seçilmiş sütun təsdiqlənəcək',
  column_level_system: 'Sütun-səviyyəli təsdiq sistemi',
  other_columns_not_affected: 'Digər sütunlar təsirlənməyəcək',
  
  // Permissions
  no_approval_permission: 'Təsdiq etmək üçün icazəniz yoxdur',
  no_edit_permission: 'Redaktə etmək üçün icazəniz yoxdur',
  
  // Help text - Enhanced
  help_sector_data: 'Bu məlumat birbaşa sektor üçün qeyd ediləcək',
  help_school_data: 'Bu məlumat məktəblər üçün daxil ediləcək',
  help_superadmin: 'SuperAdmin bütün kateqoriyaları idarə edə bilər',
  help_regionadmin: 'Region adminləri bütün kateqoriyaları idarə edə bilər',
  help_sectoradmin: 'Sektor adminləri bütün kateqoriyaları idarə edə bilər',
  help_schooladmin: 'Məktəb adminləri yalnız məktəb kateqoriyalarını görə bilər',
  help_column_level: 'Hər sütun üçün ayrı-ayrı təsdiq tələb olunur',
  help_independent_approval: 'Sütunlar müstəqil olaraq təsdiqlənir',
  
  // Statistics
  total_schools: 'Ümumi Məktəb',
  pending_count: 'Gözləyən',
  approved_count: 'Təsdiqlənmiş',
  rejected_count: 'Rədd edilmiş',
  completion_rate: 'Tamamlanma',
  completion_percentage: 'Tamamlanma',
  
  // Summary
  schools_shown: 'məktəb göstərilir',
  filter_status: 'Filtr:',
  search_term: 'Axtarış:',
  required_fields: 'məcburi',
  optional_fields: 'ixtiyari sütun',
  
  // Progress
  progress_title: 'Gedişat',
  progress_category: 'Məlumat növünü seçin',
  progress_column: 'Məlumat sütununu seçin',
  progress_data: 'Məktəb məlumatlarını idarə edin',
  
  // Column info
  column_type: 'Tip:',
  column_category: 'Kateqoriya:',
  column_required: 'Məcburi',
  column_optional: 'İxtiyari',
  column_level_approval: 'Sütun-səviyyəli təsdiq'
} as const;

export type DataManagement = typeof dataManagement;
export default dataManagement;
