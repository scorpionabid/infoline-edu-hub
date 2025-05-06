
import { useState, useCallback } from 'react';
import { FullUserData } from '@/types/supabase';
import { useUserFetch } from '@/hooks/user/useUserFetch';
import { usePermissions } from '@/hooks/auth/usePermissions';

export interface UserFilter {
  role?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: string;
  search?: string;
}

export const useUserList = (initialFilter: UserFilter = {}) => {
  const { regionId, sectorId, isSectorAdmin, isRegionAdmin } = usePermissions();
  
  // Mövcud icazələrə əsasən ilkin filtr dəyərlərini müəyyən et
  const defaultFilter: UserFilter = {
    ...initialFilter
  };
  
  if (isSectorAdmin && sectorId) {
    defaultFilter.sectorId = sectorId;
    defaultFilter.role = 'schooladmin';
  }
  
  if (isRegionAdmin && regionId) {
    defaultFilter.regionId = regionId;
  }
  
  const [filter, setFilter] = useState<UserFilter>(defaultFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { users, loading, error, totalCount, refetch } = useUserFetch(filter, currentPage, pageSize);
  
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  const updateFilter = useCallback((newFilter: UserFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Filtr dəyişdikdə ilk səhifəyə qayıt
  }, []);
  
  const resetFilter = useCallback(() => {
    setFilter(defaultFilter);
    setCurrentPage(1);
  }, [defaultFilter]);
  
  return {
    users,
    loading,
    error,
    filter,
    updateFilter,
    resetFilter,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    refetch
  };
};
