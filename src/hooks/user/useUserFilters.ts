
import { useState, useCallback } from 'react';
import { UserFilter } from '@/hooks/useUserList';

export const useUserFilters = () => {
  // Initialize with empty strings instead of undefined
  const [filter, setFilter] = useState<UserFilter>({
    search: '',
    role: '',
    status: '',
    regionId: '',
    sectorId: '',
    schoolId: ''
  });

  const updateFilter = useCallback((newFilter: Partial<UserFilter>) => {
    // Ensure no undefined values are set
    const safeFilter = Object.entries(newFilter).reduce((acc, [key, value]) => {
      acc[key] = value === undefined ? '' : value;
      return acc;
    }, {} as Record<string, any>);
    
    setFilter(prev => ({ ...prev, ...safeFilter }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({
      search: '',
      role: '',
      status: '',
      regionId: '',
      sectorId: '',
      schoolId: ''
    });
  }, []);

  return {
    filter,
    updateFilter,
    resetFilter
  };
};
