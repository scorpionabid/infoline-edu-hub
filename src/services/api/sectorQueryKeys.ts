
export const sectorDataEntryKeys = {
  all: ['sectorDataEntries'] as const,
  byCategoryAndSector: (categoryId: string, sectorId: string) => 
    [...sectorDataEntryKeys.all, 'byCategoryAndSector', categoryId, sectorId] as const,
  byCategory: (categoryId: string) => 
    [...sectorDataEntryKeys.all, 'byCategory', categoryId] as const,
  bySector: (sectorId: string) => 
    [...sectorDataEntryKeys.all, 'bySector', sectorId] as const,
};
