// Sectors translation module
export const sectors = {
  // Basic terms
  sector: 'Sektor',
  sectors: 'Sektorlar',
  title: 'Sektorlar',
  
  // Actions
  addSector: 'Sektor əlavə et',
  add_sector: 'Sektor əlavə et',
  editSector: 'Sektoru redaktə et',
  deleteSector: 'Sektoru sil',
  
  // Properties
  name: 'Ad',
  code: 'Kod',
  region: 'Region',
  status: 'Status',
  completion: 'Tamamlanma',
  
  // Messages
  sectorCreated: 'Sektor yaradıldı',
  sectorUpdated: 'Sektor yeniləndi',
  sectorDeleted: 'Sektor silindi',
  createSuccess: 'Sektor uğurla yaradıldı',
  createError: 'Sektor yaradılarkən xəta baş verdi',
  updateSuccess: 'Sektor uğurla yeniləndi',
  updateError: 'Sektor yenilənərkən xəta baş verdi',
  deleteSuccess: 'Sektor uğurla silindi',
  deleteError: 'Sektor silinərkən xəta baş verdi',
  loadError: 'Sektorlar yüklənərkən xəta baş verdi',
  refreshError: 'Sektorlar yenilənərkən xəta baş verdi',
  noSectorsFound: 'Heç bir sektor tapılmadı',
  noSectorsDescription: 'Yeni sektor əlavə etmək üçün "Sektor əlavə et" düyməsinə basın',
  selectRegion: 'Region seçin',
  enterSectorName: 'Sektor adını daxil edin',
  enterSectorDescription: 'Sektor təsvirini daxil edin',
  saving: 'Saxlanır...',
  
  // Admin management
  assign_admin: 'Admin təyin et',
  assign_sector_admin: 'Sektor admin təyin et',
  assignAdmin: 'Admin təyin et',
  sectorAdmin: 'Sektor Admini',
  adminAssigned: 'Admin təyin edildi',
  adminEmail: 'Admin e-poçtu',
  noAdminAssigned: 'Admin təyin edilməyib',
  adminAssignedSuccessfully: 'Admin uğurla təyin edildi',
  errorAssigningAdmin: 'Admin təyin edilərkən xəta baş verdi',
  sectorAdminAssignSuccess: 'Sektor admini uğurla təyin edildi',
  selectUser: 'İstifadəçi seçin',
  select_user_for_sector: 'Bu sektor üçün istifadəçi seçin',
  noUsersFound: 'İstifadəçi tapılmadı',
  noUsersFoundForSearch: 'Axtarışınıza uyğun istifadəçi tapılmadı',
  errorFetchingUsers: 'İstifadəçiləri əldə edərkən xəta baş verdi',
  assigning: 'Təyin edilir...',
  assign: 'Təyin et',
  search_users: 'İstifadəçiləri axtar...',
  unassignedUsers: 'Təyin edilməmiş istifadəçilər',
  regionalUsers: 'Regional istifadəçilər',
  userCategory: 'İstifadəçi kateqoriyası',
  noAssignableUsers: 'Təyin edilə bilən istifadəçi yoxdur',
  loading: 'Yüklənir...',
  cancel: 'Ləğv et',
  unknownError: 'Bilinməyən xəta'
} as const;

export type Sectors = typeof sectors;
export default sectors;
