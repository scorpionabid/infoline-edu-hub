/**
 * React Query üçün sorğu açarlarını standartlaşdıran köməkçi funksiyalar
 * 
 * Bu funksiyalar sorğu açarlarının bütün tətbiq boyunca eyni formada 
 * istifadə edilməsini təmin edir.
 */

/**
 * Kateqoriyalar üçün sorğu açarları
 */
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...categoryKeys.lists(), { ...filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  columns: (id: string) => [...categoryKeys.detail(id), 'columns'] as const,
};

/**
 * Məlumat daxil etmələri üçün sorğu açarları
 */
export const dataEntryKeys = {
  all: ['dataEntries'] as const,
  lists: () => [...dataEntryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...dataEntryKeys.lists(), { ...filters }] as const,
  byCategory: (categoryId: string) => [...dataEntryKeys.lists(), { categoryId }] as const,
  bySchool: (schoolId: string) => [...dataEntryKeys.lists(), { schoolId }] as const,
  byCategoryAndSchool: (categoryId: string, schoolId: string) => 
    [...dataEntryKeys.lists(), { categoryId, schoolId }] as const,
};

/**
 * Sütunlar üçün sorğu açarları
 */
export const columnKeys = {
  all: ['columns'] as const,
  lists: () => [...columnKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...columnKeys.lists(), { ...filters }] as const,
  byCategory: (categoryId: string) => [...columnKeys.lists(), { categoryId }] as const,
  details: () => [...columnKeys.all, 'detail'] as const,
  detail: (id: string) => [...columnKeys.details(), id] as const,
};

/**
 * Məktəblər üçün sorğu açarları
 */
export const schoolKeys = {
  all: ['schools'] as const,
  lists: () => [...schoolKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...schoolKeys.lists(), { ...filters }] as const,
  byRegion: (regionId: string) => [...schoolKeys.lists(), { regionId }] as const,
  bySector: (sectorId: string) => [...schoolKeys.lists(), { sectorId }] as const,
  details: () => [...schoolKeys.all, 'detail'] as const,
  detail: (id: string) => [...schoolKeys.details(), id] as const,
};

/**
 * Regionlar üçün sorğu açarları
 */
export const regionKeys = {
  all: ['regions'] as const,
  lists: () => [...regionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...regionKeys.lists(), { ...filters }] as const,
  details: () => [...regionKeys.all, 'detail'] as const,
  detail: (id: string) => [...regionKeys.details(), id] as const,
  sectors: (id: string) => [...regionKeys.detail(id), 'sectors'] as const,
};
