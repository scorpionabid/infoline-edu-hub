
export const dataEntryKeys = {
  all: ['dataEntries'] as const,
  lists: () => [...dataEntryKeys.all, 'list'] as const,
  list: (filters: string) => [...dataEntryKeys.lists(), { filters }] as const,
  details: () => [...dataEntryKeys.all, 'detail'] as const,
  detail: (id: string) => [...dataEntryKeys.details(), id] as const,
  byCategoryAndSchool: (categoryId: string, schoolId: string) => 
    [...dataEntryKeys.all, 'category', categoryId, 'school', schoolId] as const,
};

export const sectorDataEntryKeys = {
  all: ['sectorDataEntries'] as const,
  lists: () => [...sectorDataEntryKeys.all, 'list'] as const,
  list: (filters: string) => [...sectorDataEntryKeys.lists(), { filters }] as const,
  details: () => [...sectorDataEntryKeys.all, 'detail'] as const,
  detail: (id: string) => [...sectorDataEntryKeys.details(), id] as const,
  byCategoryAndSector: (categoryId: string, sectorId: string) => 
    [...sectorDataEntryKeys.all, 'category', categoryId, 'sector', sectorId] as const,
};
