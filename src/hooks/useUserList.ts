
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
  
  // Ensure filter properties are correctly initialized
  const defaultFilter: UserFilter = {
    search: '',
    role: '',
    status: '',
    regionId: isRegionAdmin ? regionId : '',
    sectorId: isSectorAdmin ? sectorId : '',
    schoolId: '',
    ...initialFilter
  };
  
  const [filter, setFilter] = useState<UserFilter>(defaultFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { users, loading, error, totalCount, refetch } = useUserFetch(filter, currentPage, pageSize);
  
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  const updateFilter = useCallback((newFilter: UserFilter) => {
    // Ensure we're not setting any undefined values
    const safeFilter = Object.entries(newFilter || {}).reduce((acc, [key, value]) => {
      acc[key] = value === undefined ? '' : value;
      return acc;
    }, {} as Record<string, any>);
    
    setFilter(prev => ({ ...prev, ...safeFilter }));
    setCurrentPage(1); // Reset to first page when filter changes
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
