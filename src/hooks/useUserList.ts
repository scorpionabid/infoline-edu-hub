
import { useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Track if filter updates are from internal or external sources
  const isFilterUpdating = useRef(false);
  
  // Use the optimized fetch hook
  const { users, loading, error, totalCount, refetch } = useUserFetch(filter, currentPage, pageSize);
  
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  // Memoized update filter function to prevent unnecessary filter changes
  const updateFilter = useCallback((newFilter: UserFilter) => {
    if (isFilterUpdating.current) return;
    
    isFilterUpdating.current = true;
    
    // Ensure we're not setting any undefined values
    const safeFilter = Object.entries(newFilter || {}).reduce((acc, [key, value]) => {
      acc[key] = value === undefined ? '' : value;
      return acc;
    }, {} as Record<string, any>);
    
    setFilter(prev => {
      // Only update if something actually changed
      const filterChanged = Object.keys(safeFilter).some(key => prev[key] !== safeFilter[key]);
      return filterChanged ? { ...prev, ...safeFilter } : prev;
    });
    
    setCurrentPage(1); // Reset to first page when filter changes
    
    // Reset flag after state updates
    setTimeout(() => {
      isFilterUpdating.current = false;
    }, 0);
  }, []);
  
  const resetFilter = useCallback(() => {
    if (isFilterUpdating.current) return;
    
    isFilterUpdating.current = true;
    setFilter(defaultFilter);
    setCurrentPage(1);
    
    // Reset flag after state updates
    setTimeout(() => {
      isFilterUpdating.current = false;
    }, 0);
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
