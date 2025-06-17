
// User Management translation module
export const userManagement = {
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
  
  // Messages
  user_created: 'İstifadəçi yaradıldı',
  user_updated: 'İstifadəçi yeniləndi',
  user_deleted: 'İstifadəçi silindi'
} as const;

export type UserManagement = typeof userManagement;
export default userManagement;
