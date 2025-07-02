
// User translation module
export const user = {
  // Basic terms
  user: 'İstifadəçi',
  users: 'İstifadəçilər',
  usersDescription: 'Sistemdəki bütün istifadəçiləri idarə edin',
  
  // User management
  create_user: 'İstifadəçi yarat',
  create_user_description: 'Yeni istifadəçi yaradın',
  edit_user: 'İstifadəçini redaktə et',
  edit_user_description: 'İstifadəçi məlumatlarını redaktə edin',
  delete_user: 'İstifadəçini sil',
  delete_user_confirmation: 'Bu istifadəçini silmək istədiyinizə əminsiniz?',
  
  // User properties
  name: 'Ad',
  fullName: 'Ad Soyad',
  email: 'E-poçt',
  phone: 'Telefon',
  role: 'Rol',
  status: 'Status',
  position: 'Vəzifə',
  language: 'Dil',
  created_at: 'Yaradılma tarixi',
  updated_at: 'Yenilənmə tarixi',
  last_login: 'Son giriş',
  lastLogin: 'Son giriş',
  never: 'Heç vaxt',
  
  // Roles
  superadmin: 'Super Admin',
  regionadmin: 'Region Admin',
  regionAdmin: 'Region Admin',
  sectoradmin: 'Sektor Admin',
  sectorAdmin: 'Sektor Admin', 
  schooladmin: 'Məktəb Admin',
  schoolAdmin: 'Məktəb Admin',
  teacher: 'Müəllim',
  
  // Status
  active: 'Aktiv',
  inactive: 'Qeyri-aktiv',
  suspended: 'Dayandırılıb',
  
  // Filters and search
  searchUsers: 'İstifadəçiləri axtarın',
  filters: 'Filtrlər',
  clearFilters: 'Filtrləri təmizlə',
  selectRole: 'Rol seçin',
  selectStatus: 'Status seçin',
  allRoles: 'Bütün rollar',
  allStatuses: 'Bütün statuslar',
  activeUsers: 'Aktiv İstifadəçilər',
  inactiveUsers: 'Deaktiv İstifadəçilər',
  allUsers: 'Bütün İstifadəçilər',
  deletedUsers: 'Silinmiş İstifadəçilər',
  school: 'Məktəb',
  schoolId: 'Məktəb ID',
  
  // Actions
  edit: 'Redaktə et',
  delete: 'Sil',
  restore: 'Bərpa et',
  deleted: 'Silinib',
  view: 'Bax',
  viewDetails: 'Detalları gör',
  resetPassword: 'Şifrəni sıfırla',
  actions: 'Əməliyyatlar',
  save: 'Yadda saxla',
  saving: 'Yadda saxlanır...',
  cancel: 'İmtina',
  
  // Delete options
  deleteType: 'Silmə növü',
  softDelete: 'Yumşaq silmə',
  hardDelete: 'Tamamilə sil',
  softDeleteDesc: 'İstifadəçi deaktiv ediləcək, məlumatlar saxlanacaq',
  hardDeleteDesc: 'İstifadəçi və bütün məlumatları tamamilə silinəcək',
  
  // User details
  userDetails: 'İstifadəçi məlumatları',
  editUser: 'İstifadəçini redaktə et',
  deleteUser: 'İstifadəçini sil',
  createdAt: 'Yaradılma tarixi',
  updatedAt: 'Yenilənmə tarixi',
  
  // Messages
  user_created: 'İstifadəçi yaradıldı',
  user_updated: 'İstifadəçi yeniləndi',
  user_deleted: 'İstifadəçi silindi',
  admin_not_assigned: 'Admin təyin edilməyib',
  noUsers: 'İstifadəçi tapılmadı'
} as const;

export type User = typeof user;
export default user;
