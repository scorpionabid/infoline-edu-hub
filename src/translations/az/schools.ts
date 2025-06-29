
// Schools translation module
export const schools = {
  // Page title and description
  title: 'Məktəblər',
  description: 'Məktəblərin idarə edilməsi və monitorinqi',
  
  // Basic terms
  school: 'Məktəb',
  schools: 'Məktəblər',
  
  // Actions
  add_school: 'Məktəb əlavə et',
  edit_school: 'Məktəbi redaktə et',
  delete_school: 'Məktəbi sil',
  assign_admin: 'Admin təyin et',
  view_details: 'Detallara bax',
  export: 'İxrac et',
  import: 'İdxal et',
  filter: 'Filtr',
  search: 'Axtar',
  
  // Properties
  name: 'Ad',
  code: 'Kod',
  type: 'Tip',
  status: 'Status',
  region: 'Region',
  sector: 'Sektor',
  address: 'Ünvan',
  phone: 'Telefon',
  email: 'E-poçt',
  principal: 'Direktor',
  established_year: 'Yaradılma ili',
  student_count: 'Şagird sayı',
  teacher_count: 'Müəllim sayı',
  
  // Status types
  statusTypes: {
    active: 'Aktiv',
    inactive: 'Qeyri-aktiv',
    under_construction: 'Tikintidə',
    temporary_closed: 'Müvəqqəti bağlıdır',
    merged: 'Birləşdirilib'
  },
  
  // School types
  types: {
    primary: 'İbtidai məktəb',
    secondary: 'Orta məktəb',
    high: 'Lisey',
    vocational: 'Peşə məktəbi',
    special: 'Xüsusi məktəb',
    other: 'Digər'
  },
  
  // Messages
  school_created: 'Məktəb uğurla yaradıldı',
  school_updated: 'Məktəb məlumatları yeniləndi',
  school_deleted: 'Məktəb uğurla silindi',
  admin_assigned: 'Admin uğurla təyin edildi',
  admin_assignment_failed: 'Admin təyini uğursuz oldu',
  school_creation_failed: 'Məktəb yaradıla bilmədi',
  school_update_failed: 'Məktəb məlumatları yenilənə bilmədi',
  school_deletion_failed: 'Məktəb silinə bilmədi',
  no_schools_found: 'Heç bir məktəb tapılmadı',
  
  // Form labels
  form: {
    name: 'Məktəbin adı',
    code: 'Məktəb kodu',
    type: 'Məktəb tipi',
    status: 'Status',
    region: 'Region',
    sector: 'Sektor',
    address: 'Ünvan',
    phone: 'Əlaqə nömrəsi',
    email: 'E-poçt ünvanı',
    principal: 'Direktorun adı',
    establishedYear: 'Yaradılma ili',
    website: 'Veb səhifə',
    description: 'Təsvir',
    logo: 'Loqo',
    photo: 'Şəkil',
    coordinates: 'Koordinatlar',
    latitude: 'Enlik',
    longitude: 'Uzunluq'
  },
  
  // Buttons
  save: 'Yadda saxla',
  cancel: 'Ləğv et',
  delete: 'Sil',
  edit: 'Redaktə et',
  view: 'Baxış',
  assign: 'Təyin et',
  
  // Confirmation dialogs
  confirm: {
    delete: 'Bu məktəbi silmək istədiyinizə əminsiniz?',
    deleteDescription: 'Bu əməliyyat geri qaytarıla bilməz. Məktəb və bütün əlaqəli məlumatlar silinəcək.',
    deactivate: 'Bu məktəbi deaktiv etmək istədiyinizə əminsiniz?',
    deactivateDescription: 'Deaktiv edilmiş məktəblər sistemdə göstərilməyə bilər.',
    activate: 'Bu məktəbi aktiv etmək istədiyinizə əminsiniz?',
    activateDescription: 'Aktiv edilmiş məktəblər sistemdə göstəriləcək.'
  },
  
  // Admin assignment
  adminAssignment: {
    title: 'Admin təyini',
    selectAdmin: 'Admin seçin',
    currentAdmin: 'Cari Admin',
    noAdmin: 'Təyin edilməyib',
    assign: 'Admin təyin et',
    change: 'Admini dəyiş',
    remove: 'Admi sil',
    success: 'Admin uğurla təyin edildi',
    error: 'Admin təyini zamanı xəta baş verdi',
    confirmRemove: 'Admi silmək istədiyinizə əminsiniz?',
    confirmChange: 'Admini dəyişdirmək istədiyinizə əminsiniz?'
  },
  
  // School admin assignment - New additions
  assign_school_admin: 'Məktəb admin təyin et',
  select_user_for_school: 'Zəhmət olmasa bu məktəb üçün istifadəçi seçin:',
  selectUser: 'İstifadəçi seçin',
  search_users: 'İstifadəçiləri axtar...',
  loading: 'Yüklənir...',
  assigning: 'Təyin edilir...',
  adminAssignedSuccessfully: 'Admin uğurla təyin edildi',
  errorFetchingUsers: 'İstifadəçiləri əldə edərkən xəta baş verdi',
  unknownError: 'Bilinməyən xəta',
  noUsersFound: 'Təyin edilə bilən istifadəçi tapılmadı',
  noUsersFoundForSearch: 'Axtarışınıza uyğun istifadəçi tapılmadı',
  
  // Import/Export
  importExport: {
    import: 'Məktəbləri idxal et',
    export: 'Məktəbləri ixrac et',
    downloadTemplate: 'Şablonu yüklə',
    fileFormat: 'Dəstəklənən formatlar: .xlsx, .csv',
    importSuccess: 'Məktəblər uğurla idxal edildi',
    importError: 'İdxal zamanı xəta baş verdi',
    exportSuccess: 'Məktəblər uğurla ixrac edildi',
    exportError: 'İxrac zamanı xəta baş verdi',
    instructions: 'Məktəb məlumatlarını idxal etmək üçün şablondan istifadə edin və faylı yükləyin.'
  },
  
  // Search and filter
  searchPlaceholder: 'Məktəb adı, kodu və ya ünvanı ilə axtarış',
  filterBy: 'Filtrlə',
  clearFilters: 'Filtrləri təmizlə',
  noResults: 'Nəticə tapılmadı',
  
  // Statistics
  statistics: {
    totalSchools: 'Ümumi Məktəblər',
    activeSchools: 'Aktiv Məktəblər',
    studentsPerSchool: 'Məktəbə düşən şagird sayı',
    teachersPerSchool: 'Məktəbə düşən müəllim sayı',
    byRegion: 'Region üzrə məktəblər',
    byType: 'Növünə görə məktəblər',
    byStatus: 'Statusuna görə məktəbler'
  },
  
  // School details
  details: {
    title: 'Məktəb haqqında məlumat',
    basicInfo: 'Əsas məlumatlar',
    contactInfo: 'Əlaqə məlumatları',
    location: 'Yerləşmə',
    staff: 'İşçi heyəti',
    students: 'Şagirdlər',
    classes: 'Siniflər',
    documents: 'Sənədlər',
    history: 'Tarixçə',
    lastUpdated: 'Son yenilənmə',
    created: 'Yaradılıb',
    updated: 'Yenilənib'
  },
  
  // Errors
  errors: {
    loadFailed: 'Məktəb məlumatları yüklənərkən xəta baş verdi',
    saveFailed: 'Məktəb məlumatları yadda saxlanıla bilmədi',
    deleteFailed: 'Məktəb silinərkən xəta baş verdi',
    invalidForm: 'Zəhmət olmasa bütün məcburi sahələri doldurun',
    nameRequired: 'Məktəb adı tələb olunur',
    codeRequired: 'Məktəb kodu tələb olunur',
    typeRequired: 'Məktəb tipi tələb olunur',
    statusRequired: 'Status tələb olunur',
    regionRequired: 'Region tələb olunur',
    sectorRequired: 'Sektor tələb olunur'
  }
} as const;

export type Schools = typeof schools;
export default schools;
