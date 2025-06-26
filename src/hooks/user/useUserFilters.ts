
import { useState } from 'react';
import { UserRole, UserStatus, UserFilter } from '@/types/user';

export const useUserFilters = () => {
  const [filters, setFilters] = useState<UserFilter>({
    role: [],
    status: [],
    search: '',
    regionId: undefined,
    sectorId: undefined,
    schoolId: undefined
  });

  const updateFilter = (key: keyof UserFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      role: [],
      status: [],
      search: '',
      regionId: undefined,
      sectorId: undefined,
      schoolId: undefined
    });
  };

  return {
    filters,
    updateFilter,
    // clearFilters
  };
};
