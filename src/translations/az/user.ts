
// User translation module - User related translations
export const user = {
  // User entities
  user: 'İstifadəçi',
  users: 'İstifadəçilər',
  username: 'İstifadəçi adı',
  
  // User information
  full_name: 'Ad Soyad',
  first_name: 'Ad',
  last_name: 'Soyad',
  email: 'E-poçt',
  phone: 'Telefon',
  position: 'Vəzifə',
  department: 'Şöbə',
  role: 'Rol',
  status: 'Status',
  
  // User roles
  superadmin: 'Super Admin',
  regionadmin: 'Region Admini',
  sectoradmin: 'Sektor Admini',
  schooladmin: 'Məktəb Admini',
  user_role: 'İstifadəçi Rolu',
  
  // User status
  active: 'Aktiv',
  inactive: 'Qeyri-aktiv',
  pending: 'Gözləyir',
  suspended: 'Dayandırılıb',
  
  // User actions
  add_user: 'İstifadəçi əlavə et',
  edit_user: 'İstifadəçini redaktə et',
  delete_user: 'İstifadəçini sil',
  view_user: 'İstifadəçiyə bax',
  activate_user: 'İstifadəçini aktiv et',
  deactivate_user: 'İstifadəçini deaktiv et',
  reset_password: 'Şifrəni sıfırla',
  change_role: 'Rolunu dəyişdir',
  
  // User management
  user_management: 'İstifadəçi İdarəetməsi',
  user_list: 'İstifadəçi Siyahısı',
  user_details: 'İstifadəçi Təfərrüatları',
  user_permissions: 'İstifadəçi İcazələri',
  user_settings: 'İstifadəçi Parametrləri',
  
  // User creation
  create_user: 'İstifadəçi yarat',
  user_created: 'İstifadəçi yaradıldı',
  user_updated: 'İstifadəçi yeniləndi',
  user_deleted: 'İstifadəçi silindi',
  
  // Validation messages
  user_required: 'İstifadəçi mütləqdir',
  email_required: 'E-poçt mütləqdir',
  invalid_email: 'Səhv e-poçt formatı',
  password_required: 'Şifrə mütləqdir',
  
  // Admin assignments
  admin_not_assigned: 'Admin təyin edilməyib',
  assign_admin: 'Admin təyin et',
  remove_admin: 'Admini sil',
  
  // User search and filter
  search_users: 'İstifadəçiləri axtar',
  filter_by_role: 'Rola görə filtr',
  filter_by_status: 'Statusa görə filtr',
  no_users_found: 'İstifadəçi tapılmadı'
} as const;

export type User = typeof user;
export default user;
