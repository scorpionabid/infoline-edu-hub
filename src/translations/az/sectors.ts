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
  sectorDeleted: 'Sektor silindi'
} as const;

export type Sectors = typeof sectors;
export default sectors;
