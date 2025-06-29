
// User translation module
export const user = {
  // Basic terms
  user: 'İstifadəçi',
  users: 'İstifadəçilər',
  
  // User management
  create_user: 'İstifadəçi yarat',
  create_user_description: 'Yeni istifadəçi yaradın',
  edit_user: 'İstifadəçini redaktə et',
  edit_user_description: 'İstifadəçi məlumatlarını redaktə edin',
  delete_user: 'İstifadəçini sil',
  delete_user_confirmation: 'Bu istifadəçini silmək istədiyinizə əminsiniz?',
  
  // User properties
  name: 'Ad',
  email: 'E-poçt',
  phone: 'Telefon',
  role: 'Rol',
  status: 'Status',
  created_at: 'Yaradılma tarixi',
  last_login: 'Son giriş',
  
  // Roles
  superadmin: 'Super Admin',
  regionadmin: 'Region Admin',
  sectoradmin: 'Sektor Admin',
  schooladmin: 'Məktəb Admin',
  teacher: 'Müəllim',
  
  // Status
  active: 'Aktiv',
  inactive: 'Qeyri-aktiv',
  suspended: 'Dayandırılıb',
  
  // Messages
  user_created: 'İstifadəçi yaradıldı',
  user_updated: 'İstifadəçi yeniləndi',
  user_deleted: 'İstifadəçi silindi',
  admin_not_assigned: 'Admin təyin edilməyib'
} as const;

export type User = typeof user;
export default user;
