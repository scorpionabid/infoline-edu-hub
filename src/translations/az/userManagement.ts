
// User Management translation module
export const userManagement = {
  // Page title and description
  title: 'İstifadəçi İdarəetməsi',
  description: 'Sistem istifadəçilərini idarə edin və tənzimləmələri konfiqurasiya edin',
  
  // Actions
  export: 'İxrac et',
  import: 'İdxal et',
  createUser: 'Yeni İstifadəçi',
  
  // Stats section
  stats: {
    totalUsers: 'Ümumi İstifadəçilər',
    activeUsers: 'Aktiv İstifadəçilər',
    admins: 'Adminlər',
    regionAdmins: 'Region Adminləri',
    sectorAdmins: 'Sektor Adminləri',
    schoolAdmins: 'Məktəb Adminləri',
    regularUsers: 'Adi İstifadəçilər'
  },
  
  // Basic terms
  user_management: 'İstifadəçi İdarəetməsi',
  manage_users: 'İstifadəçiləri idarə et',
  
  // Actions
  add_user: 'İstifadəçi əlavə et',
  edit_user: 'İstifadəçini redaktə et',
  delete_user: 'İstifadəçini sil',
  activate_user: 'İstifadəçini aktiv et',
  deactivate_user: 'İstifadəçini deaktiv et',
  
  // Properties
  username: 'İstifadəçi adı',
  email: 'E-poçt',
  role: 'Rol',
  status: 'Status',
  created: 'Yaradılıb',
  lastLogin: 'Son giriş',
  actions: 'Əməliyyatlar',
  
  // Page sections
  tabs: {
    overview: 'Ümumi baxış',
    users: 'İstifadəçilər',
    roles: 'Rollar',
    permissions: 'İcazələr',
    activity: 'Fəaliyyət',
    settings: 'Parametrlər',
    audit_log: 'Audit jurnalı'
  },
  
  // Messages
  user_created: 'İstifadəçi yaradıldı',
  user_updated: 'İstifadəçi yeniləndi',
  user_deleted: 'İstifadəçi silindi',
  
  // Status messages
  loading: 'Yüklənir...',
  noUsers: 'İstifadəçi tapılmadı',
  
  // Form labels
  form: {
    firstName: 'Ad',
    lastName: 'Soyad',
    email: 'E-poçt ünvanı',
    phone: 'Telefon nömrəsi',
    role: 'Rol',
    password: 'Şifrə',
    confirmPassword: 'Şifrəni təsdiqlə',
    status: 'Status',
    region: 'Region',
    sector: 'Sektor',
    school: 'Məktəb'
  },
  
  // Buttons
  save: 'Yadda saxla',
  cancel: 'Ləğv et',
  reset: 'Sıfırla',
  search: 'Axtar',
  filter: 'Filtr',
  
  // Success messages
  success: {
    userCreated: 'İstifadəçi uğurla yaradıldı',
    userUpdated: 'İstifadəçi məlumatları yeniləndi',
    userDeleted: 'İstifadəçi uğurla silindi',
    statusChanged: 'Status uğurla dəyişdirildi'
  },
  
  // Error messages
  error: {
    createUser: 'İstifadəçi yaradılmadı',
    updateUser: 'İstifadəçi məlumatları yenilənmədi',
    deleteUser: 'İstifadəçi silinmədi',
    loadUsers: 'İstifadəçilər yüklənərkən xəta baş verdi',
    invalidForm: 'Zəhmət olmasa bütün məcburi sahələri doldurun',
    passwordMismatch: 'Şifrələr üst-üstə düşmür'
  },
  
  // Confirmation dialogs
  confirm: {
    deleteUser: 'Bu istifadəçini silmək istədiyinizə əminsiniz?',
    deactivateUser: 'Bu istifadəçini deaktiv etmək istədiyinizə əminsiniz?',
    resetPassword: 'İstifadəçinin şifrəsini sıfırlamaq istədiyinizə əminsiniz?'
  },
  
  // User roles
  roles: {
    superadmin: 'Super Admin',
    regionadmin: 'Region Admini',
    sectoradmin: 'Sektor Admini',
    schooladmin: 'Məktəb Admini',
    user: 'İstifadəçi'
  },
  
  // Status types
  statusTypes: {
    active: 'Aktiv',
    inactive: 'Qeyri-aktiv',
    pending: 'Gözləyir',
    suspended: 'Dayandırılıb'
  },
  
  // Bulk actions
  bulkActions: {
    title: 'Toplu Əməliyyatlar',
    activate: 'Aktiv et',
    deactivate: 'Deaktiv et',
    delete: 'Sil',
    export: 'Seçilmişləri ixrac et',
    selectedCount: 'seçilib'
  },
  
  // Import/Export
  importExport: {
    importUsers: 'İstifadəçiləri idxal et',
    exportUsers: 'İstifadəçiləri ixrac et',
    downloadTemplate: 'Şablonu yüklə',
    fileFormat: 'Dəstəklənən formatlar: .xlsx, .csv',
    importSuccess: 'İstifadəçilər uğurla idxal edildi',
    importError: 'İdxal zamanı xəta baş verdi',
    exportSuccess: 'İstifadəçilər uğurla ixrac edildi',
    exportError: 'İxrac zamanı xəta baş verdi'
  },
  
  // User activity
  activity: {
    login: 'Daxil oldu',
    logout: 'Çıxış etdi',
    profileUpdate: 'Profil məlumatlarını yenilədi',
    passwordChange: 'Şifrəsini dəyişdi',
    userCreated: 'Yeni istifadəçi yaratdı',
    userUpdated: 'İstifadəçi məlumatlarını yenilədi',
    userDeleted: 'İstifadəçini sildi'
  }

} as const;

export type UserManagement = typeof userManagement;
export default userManagement;
