
import { useState, useCallback } from 'react';
import { UserFilter } from '@/types/user';

export const useUserFilters = (initialFilter: UserFilter = {}) => {
  // Initialize with empty strings instead of undefined
  const defaultFilter: UserFilter = {
    search: '',
    role: '',
    status: '',
    regionId: '',
    sectorId: '',
    schoolId: '',
    region_id: '',
    sector_id: '',
    school_id: '',
    ...initialFilter
  };

  const [filter, setFilter] = useState<UserFilter>(defaultFilter);

  const updateFilter = useCallback((newFilter: Partial<UserFilter>) => {
    // Ensure no undefined values are set
    const safeFilter = Object.entries(newFilter || {}).reduce((acc, [key, value]) => {
      acc[key] = value === undefined ? '' : value;
      return acc;
    }, {} as Record<string, any>);
    
    setFilter(prev => ({ ...prev, ...safeFilter }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(defaultFilter);
  }, [defaultFilter]);

  return {
    filter,
    updateFilter,
    resetFilter
  };
};
