
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
  const ignorePageChange = useRef(false);
  
  // Add a ref for storing the last page request
  const lastPageChangeRef = useRef<number | null>(null);
  const filterChangeTimeRef = useRef<number>(0);
  
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
  // But only do this when we're not explicitly changing the page
  useEffect(() => {
    if (fetchedPage && fetchedPage !== currentPage && !skipNextPageReset.current && !ignorePageChange.current) {
      console.log(`useUserList: Syncing page from fetchedPage: ${fetchedPage} (current: ${currentPage})`);
      setCurrentPage(fetchedPage);
    }
  }, [fetchedPage, currentPage]);

  // Prevent double page reset by tracking filter change time
  useEffect(() => {
    const now = Date.now();
    // Only reset page if it's been more than 300ms since the last filter change
    // This prevents page reset during a filter batch update
    if (now - filterChangeTimeRef.current > 300 && !skipNextPageReset.current) {
      filterChangeTimeRef.current = now;
      
      if (currentPage !== 1) {
        console.log('useUserList: Filter changed, resetting to page 1');
        ignorePageChange.current = true;
        setCurrentPage(1);
        
        // Reset the ignore flag after the state update completes
        setTimeout(() => {
          ignorePageChange.current = false;
        }, 0);
      }
    }
  }, [filter]);
  
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  // Handle page change separately to avoid resetting page on filter changes
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    
    // Set flag to skip automatic page reset due to filter changes
    skipNextPageReset.current = true;
    
    // Store the requested page
    lastPageChangeRef.current = page;
    ignorePageChange.current = true;
    
    console.log('useUserList: Explicitly changing to page:', page);
    setCurrentPage(page);
    
    // Reset the flags after a short delay to handle any race conditions
    setTimeout(() => {
      skipNextPageReset.current = false;
      ignorePageChange.current = false;
    }, 100);
  }, [totalPages]);
  
  // Memoized update filter function to prevent unnecessary filter changes
  const updateFilter = useCallback((newFilter: UserFilter) => {
    if (isFilterUpdating.current) return;
    
    isFilterUpdating.current = true;
    filterChangeTimeRef.current = Date.now();
    
    // Ensure we're not setting any undefined values
    const safeFilter = Object.entries(newFilter || {}).reduce((acc, [key, value]) => {
      acc[key] = value === undefined ? '' : value;
      return acc;
    }, {} as Record<string, any>);
    
    console.log('useUserList: Updating filter:', safeFilter);
    
    setFilter(prev => {
      // Only update if something actually changed
      const filterChanged = Object.keys(safeFilter).some(key => prev[key] !== safeFilter[key]);
      return filterChanged ? { ...prev, ...safeFilter } : prev;
    });
    
    // Only reset to first page if filter is changing and we're not in a page change operation
    if (!skipNextPageReset.current) {
      // We'll let the filter effect handle page resetting
    }
    
    // Reset flag after state updates
    setTimeout(() => {
      isFilterUpdating.current = false;
    }, 0);
  }, []);
  
  const resetFilter = useCallback(() => {
    if (isFilterUpdating.current) return;
    
    isFilterUpdating.current = true;
    filterChangeTimeRef.current = Date.now();
    
    console.log('useUserList: Resetting filter to defaults');
    setFilter(defaultFilter);
    
    // Always reset to first page on full filter reset
    if (currentPage !== 1) {
      ignorePageChange.current = true;
      setCurrentPage(1);
      
      setTimeout(() => {
        ignorePageChange.current = false;
      }, 0);
    }
    
    // Reset flag after state updates
    setTimeout(() => {
      isFilterUpdating.current = false;
    }, 0);
  }, [defaultFilter, currentPage]);
  
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
