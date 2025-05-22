
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
  
  // Ensure filter properties are correctly initialized with useMemo to prevent recreation
  const defaultFilter = useMemo(() => ({
    search: '',
    role: '',
    status: '',
    regionId: isRegionAdmin ? regionId : '',
    sectorId: isSectorAdmin ? sectorId : '',
    schoolId: '',
    ...initialFilter
  }), [regionId, sectorId, isRegionAdmin, isSectorAdmin, initialFilter]);
  
  const [filter, setFilter] = useState<UserFilter>(defaultFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Track if filter updates are from internal or external sources
  const isFilterUpdating = useRef(false);
  const skipNextPageReset = useRef(false);
  
  // Add a ref for storing the last page request
  const lastPageChangeRef = useRef<number | null>(null);
  
  // Use the optimized fetch hook
  const { 
    users, 
    loading, 
    error, 
    totalCount, 
    refetch,
    currentPage: fetchedPage 
  } = useUserFetch(filter, currentPage, pageSize);
  
  // Synchronize the current page with the page in useUserFetch if it differs
  useEffect(() => {
    if (fetchedPage && fetchedPage !== currentPage && !skipNextPageReset.current) {
      setCurrentPage(fetchedPage);
    }
  }, [fetchedPage]);
  
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  // Handle page change separately to avoid resetting page on filter changes
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    
    // Store the requested page
    lastPageChangeRef.current = page;
    
    // Set flag to skip automatic page reset when filter changes
    skipNextPageReset.current = true;
    
    console.log('useUserList: Changing to page:', page);
    setCurrentPage(page);
    
    // Reset the flag after a short delay to handle any race conditions
    setTimeout(() => {
      skipNextPageReset.current = false;
    }, 100);
  }, [totalPages]);
  
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
    
    // Only reset to first page if filter is changing (not for page navigation)
    if (!skipNextPageReset.current) {
      setCurrentPage(1);
    }
    
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
    setCurrentPage: handlePageChange,
    refetch
  };
};
