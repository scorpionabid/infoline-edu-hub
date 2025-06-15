
import { useState } from 'react';
import { UserRole, UserStatus } from '@/types/user';

export interface UserFilters {
  search: string;
  role: UserRole | '';
  status: UserStatus | '';
  regionId: string;
  sectorId: string;
  schoolId: string;
}

export const useUserFilters = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '' as UserRole | '',
    status: '' as UserStatus | '',
    regionId: '',
    sectorId: '',
    schoolId: ''
  });

  const updateFilter = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
      regionId: '',
      sectorId: '',
      schoolId: ''
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters
  };
};
