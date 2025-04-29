
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { UserFilter } from '@/hooks/useUserList';
import { FullUserData } from '@/types/user';
import { getCache, setCache } from '@/utils/cacheUtils';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { useQueryClient } from '@tanstack/react-query';

// Normal rol adlarını
const normalizeRole = (role: string | null | undefined): string => {
  if (!role) return '';
  return role.toLowerCase().trim();
};

// Rol massivini normallaşdırmaq üçün funksiya
const normalizeRoleArray = (roles: string[] | string | undefined): string[] => {
  if (!roles) return [];
  if (typeof roles === 'string') return [normalizeRole(roles)];
  return roles.map(normalizeRole).filter(Boolean);
};

export const useOptimizedUserList = (initialFilter: UserFilter = {}) => {
  const [filter, setFilter] = useState<UserFilter>(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin, regionId, sectorId } = usePermissions();
  const queryClient = useQueryClient();
  
  // Cache key yaradılması
  const createCacheKey = useCallback(() => {
    const parts = [
      'users',
      filter.role ? (typeof filter.role === 'string' ? filter.role : filter.role.join(',')) : '',
      filter.search || '',
      filter.region || filter.regionId || '',
      filter.sector || filter.sectorId || '',
      filter.school || filter.schoolId || '',
      filter.status || '',
      currentPage
    ];
    return parts.join('-');
  }, [filter, currentPage]);
  
  // Istifadəçi filtrinə əsasən opt. sorğu parametrləri
  const queryParams = useMemo(() => {
    return {
      role: filter.role ? normalizeRoleArray(filter.role) : undefined,
      search: filter.search,
      regionId: (isRegionAdmin && regionId) ? regionId : (filter.regionId || filter.region),
      sectorId: (isSectorAdmin && sectorId) ? sectorId : (filter.sectorId || filter.sector),
      schoolId: filter.schoolId || filter.school,
      status: filter.status,
      page: currentPage,
      pageSize: 10
    };
  }, [filter, currentPage, isRegionAdmin, isSectorAdmin, regionId, sectorId]);

  // Edge funksiyası ilə sorğu
  const fetchUsers = useCallback(async () => {
    console.log('Fetching users with edge function...');
    
    try {
      const response = await supabase.functions.invoke('get-all-users-with-roles', {
        body: { 
          filter: queryParams 
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return {
        users: response.data.users || [],
        totalCount: response.data.totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }, [queryParams]);

  // Keşlənmiş sorğu
  const {
    data,
    isLoading,
    error,
    refetch
  } = useCachedQuery({
    queryKey: ['users', queryParams],
    queryFn: fetchUsers,
    cacheConfig: {
      expiryInMinutes: 5
    },
    queryOptions: {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  });
  
  // Filter deyisdikde
  const updateFilter = useCallback((newFilter: UserFilter) => {
    // Normallaşdır və səhifəni sıfırla
    const normalizedFilter = { ...newFilter };
    if (newFilter.role) {
      normalizedFilter.role = typeof newFilter.role === 'string' 
        ? normalizeRole(newFilter.role) 
        : newFilter.role.map(normalizeRole);
    }
    
    setCurrentPage(1);
    setFilter(normalizedFilter);
  }, []);

  // Filter sıfırlama
  const resetFilter = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  // Extract data
  const users = useMemo(() => data?.users || [], [data]);
  const totalCount = useMemo(() => data?.totalCount || 0, [data]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / 10)), [totalCount]);

  return {
    users,
    loading: isLoading,
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
