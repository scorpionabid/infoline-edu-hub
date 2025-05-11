
import { UserFilter } from '@/hooks/useUserList';

/**
 * Ensures that all UserFilter fields have default values
 */
export const ensureFilterDefaults = (filter?: UserFilter): UserFilter => {
  if (!filter) return {
    search: '',
    role: '',
    status: '',
    regionId: '',
    sectorId: '',
    schoolId: '',
    region_id: '',
    sector_id: '',
    school_id: '',
  };
  
  return {
    search: filter.search || '',
    role: filter.role || '',
    status: filter.status || '',
    regionId: filter.regionId || filter.region_id || '',
    sectorId: filter.sectorId || filter.sector_id || '',
    schoolId: filter.schoolId || filter.school_id || '',
    region_id: filter.region_id || filter.regionId || '',
    sector_id: filter.sector_id || filter.sectorId || '',
    school_id: filter.school_id || filter.schoolId || '',
  };
};
