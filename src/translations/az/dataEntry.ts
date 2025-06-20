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
  
  // Microsoft Forms Style Interface
  microsoft_forms: {
    category_selection: 'Kateqoriya Seçimi',
    data_entry_mode: 'Məlumat Daxil Etmə',
    review_submit: 'Baxış və Təqdim',
    
    // Category selection
    overall_progress: 'Ümumi İrəliləyiş',
    total_categories: 'Ümumi kateqoriyalar',
    completed_categories: 'Tamamlanmış kateqoriyalar',
    remaining_categories: 'Qalan kateqoriyalar',
    select_category: 'Kateqoriya seçin',
    category_progress: 'Kateqoriya irəliləyişi',
    
    // Progress indicators
    not_started: 'Başlanmayıb',
    in_progress: 'Davam edir',
    completed: 'Tamamlandı',
    progress_percentage: '{percentage}% tamamlandı',
    fields_completed: '{completed} / {total} sahə',
    required_fields: '{completed} / {total} məcburi',
    
    // Navigation
    back_to_categories: 'Kateqoriyalara qayıt',
    continue_to_review: 'Baxış səhifəsinə keç',
    back_to_entry: 'Redaktəyə qayıt',
    edit_category: 'Kateqoriyanı redaktə et',
    
    // Auto-save
    auto_save: 'Avtomatik saxlama',
    auto_save_enabled: 'Avtomatik saxlama aktiv',
    auto_save_disabled: 'Avtomatik saxlama deaktiv',
    saving: 'Saxlanılır...',
    saved: 'Saxlandı',
    save_error: 'Saxlama xətası',
    unsaved_changes: 'Saxlanmamış dəyişikliklər',
    last_saved: 'Son saxlama',
    save_now: 'İndi saxla',
    retry_save: 'Yenidən cəhd et',
    clear_error: 'Xətanı sil',
    
    // Form validation
    field_required: 'Bu sahə məcburidir',
    field_valid: 'Düzgün',
    field_invalid: 'Səhv format',
    min_length: 'Minimum {min} simvol tələb olunur',
    max_length: 'Maksimum {max} simvol icazə verilir',
    min_value: 'Minimum dəyər: {min}',
    max_value: 'Maksimum dəyər: {max}',
    invalid_email: 'E-poçt formatı düzgün deyil',
    invalid_number: 'Rəqəm daxil edin',
    
    // Review mode
    data_summary: 'Məlumatların İcmalı',
    ready_to_submit: 'Təqdim etməyə hazır',
    submit_for_approval: 'Təsdiq üçün göndər',
    submitting: 'Göndərilir...',
    
    // Excel integration
    excel_integration: 'Excel İnteqrasiyası',
    download_template: 'Şablon yüklə',
    import_data: 'Məlumat idxal et',
    export_data: 'Məlumat ixrac et',
    processing_file: 'Fayl emal edilir',
    
    // Help texts
    fill_required_fields: 'Məcburi sahələri doldurun',
    auto_save_info: 'Dəyişikliklər avtomatik olaraq 3 saniyə sonra saxlanacaq',
    excel_help: 'Excel şablonu yükləyib dolduraraq toplu məlumat idxal edə bilərsiniz',
    
    // Status messages
    category_complete: 'Bu kateqoriya tamamlandı',
    category_incomplete: 'Bu kateqoriyada hələ doldurulmamış sahələr var',
    all_required_complete: 'Bütün məcburi sahələr doldurulub',
    form_ready: 'Form təqdim etməyə hazırdır',
    
    // Mobile specific
    touch_to_edit: 'Redaktə etmək üçün toxunun',
    swipe_to_navigate: 'Naviqasiya üçün çekin',
    tap_to_select: 'Seçmək üçün toxunun'
  },
  
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