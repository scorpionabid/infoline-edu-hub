
// Sectors translation module
export const sectors = {
  // Basic terms
  sector: 'Sektor',
  sectors: 'Sektorlar',
  
  // Actions
  add_sector: 'Sektor əlavə et',
  edit_sector: 'Sektoru redaktə et',
  delete_sector: 'Sektoru sil',
  
  // Properties
  name: 'Ad',
  code: 'Kod',
  region: 'Region',
  status: 'Status',
  
  // Messages
  sector_created: 'Sektor yaradıldı',
  sector_updated: 'Sektor yeniləndi',
  sector_deleted: 'Sektor silindi'
} as const;

export type Sectors = typeof sectors;
export default sectors;
