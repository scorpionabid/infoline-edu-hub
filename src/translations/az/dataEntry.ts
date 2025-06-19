
// Data Entry translation module
export const dataEntry = {
  // Basic terms
  data_entry: 'Məlumat daxil etmə',
  form: 'Form',
  forms: 'Formlar',
  entry: 'Giriş',
  
  // Form operations
  save_entry: 'Girişi saxla',
  submit_entry: 'Girişi təqdim et',
  draft_entry: 'Qaralama saxla',
  clear_form: 'Formu təmizlə',
  
  // Form status
  pending: 'Gözləyir',
  approved: 'Təsdiqləndi',
  rejected: 'Rədd edildi',
  draft: 'Qaralama',
  
  // Validation
  required_field: 'Bu sahə mütləqdir',
  invalid_data: 'Səhv məlumat',
  
  // Messages
  entry_saved: 'Giriş saxlandı',
  entry_submitted: 'Giriş təqdim edildi',
  entry_failed: 'Giriş uğursuz oldu',
  
  // Workflow specific
  workflow: {
    mode_selection: 'Rejim Seçimi',
    context_setup: 'Kateqoriya & Sütun',
    target_selection: 'Məktəb Seçimi',
    data_input: 'Məlumat Daxil Etmə',
    
    // Mode descriptions
    single_school: 'Tək Məktəb',
    bulk_school: 'Bulk Məktəb',
    single_description: 'Bir məktəb üçün məlumat daxil edin',
    bulk_description: 'Çoxlu məktəb üçün eyni məlumat',
    
    // Step descriptions
    mode_desc: 'Tək və ya bulk məlumat daxil etmə',
    context_desc: 'Məlumat növünün müəyyən edilməsi',
    target_single_desc: 'Məktəbin seçilməsi',
    target_bulk_desc: 'Çoxlu məktəbin seçilməsi',
    input_desc: 'Məlumatların daxil edilməsi və təsdiqləməsi',
    
    // Navigation
    next_to_context: 'Kateqoriya Seçiminə Keç',
    next_to_target: 'Məktəb Seçiminə Keç',
    next_to_input: 'Məlumat Daxil Etməyə Keç',
    complete: 'Tamamla',
    back: 'Geri',
    cancel: 'Ləğv et',
    
    // Help texts
    select_mode: 'Rejim seçmək lazımdır',
    select_category: 'Kateqoriya və sütun seçmək lazımdır',
    select_school: 'Ən azı bir məktəb seçmək lazımdır',
    enter_data: 'Məlumat daxil etmək lazımdır',
    
    // Features
    quick_easy: 'Tez və asan daxil etmə',
    school_specific: 'Məktəb-spesifik məlumatlar',
    real_time_validation: 'Real-time validation',
    time_saving: 'Vaxt qənaəti',
    multi_selection: 'Çoxlu məktəb seçimi',
    bulk_operations: 'Toplu əməliyyatlar',
    
    // Ideal for
    ideal_individual: 'Fərdi məlumatlar',
    ideal_standard: 'Standart məlumatlar',
    
    // Selection confirmations
    single_mode_selected: 'Tək məktəb rejimi seçildi',
    bulk_mode_selected: 'Bulk məktəb rejimi seçildi',
    proceed_next: 'İndi kateqoriya və sütun seçimi üçün növbəti addıma keçin',
    
    // Legacy notice
    legacy_component: 'Legacy Komponent',
    legacy_notice: 'Bu komponent köhnədir və artıq yeni workflow sistemi tərəfindən əvəz edilib.',
    use_new_system: 'Zəhmət olmasa yeni SectorDataEntry səhifəsini istifadə edin.',
    legacy_management: 'Sektor Məlumat İdarəetməsi (Legacy)',
    not_in_use: 'Bu interfeys artıq istifadə edilmir.',
    new_workflow_system: 'Yeni Workflow Sistemi',
    better_experience: 'Daha yaxşı istifadəçi təcrübəsi üçün yeni interfeysi istifadə edin.',
    
    // Progress
    step_of: 'Addım {current} / {total}',
    current_step: 'Hazırki addım'
  }
} as const;

export type DataEntry = typeof dataEntry;
export default dataEntry;
