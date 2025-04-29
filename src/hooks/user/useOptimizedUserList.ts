
import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { FullUserData } from '@/types/user';
import { UserRole } from '@/types/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { useQueryClient } from '@tanstack/react-query';

// Qlobal olarak bir kez tanımla
const USERS_CACHE_KEY = 'user_list';
const USER_PAGE_SIZE = 10;

export interface UserFilter {
  role?: string[] | string;
  region?: string[] | string;
  sector?: string[] | string;
  school?: string[] | string;
  search?: string;
  status?: string[] | string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

// Normallaşdırma funksiyaları
const normalizeRole = (role: string | null | undefined): string => {
  if (!role) return '';
  return role.toLowerCase().trim();
};

const normalizeRoleArray = (roles: string[] | string | undefined): string[] => {
  if (!roles) return [];
  if (typeof roles === 'string') return [normalizeRole(roles)];
  return roles.map(normalizeRole).filter(Boolean);
};

export const useOptimizedUserList = () => {
  const [filter, setFilter] = useState<UserFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { session, user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const { isRegionAdmin, isSectorAdmin, regionId, sectorId } = usePermissions();

  // Rolları normallaşdır
  const normalizedFilter = useMemo(() => {
    const result = { ...filter };
    if (filter.role) {
      result.role = typeof filter.role === 'string' ? 
        normalizeRole(filter.role) : 
        normalizeRoleArray(filter.role);
    }
    
    // Role-lara görə avtomatik filter əlavə et
    if (isRegionAdmin && regionId) {
      result.regionId = regionId;
    }
    if (isSectorAdmin && sectorId) {
      result.sectorId = sectorId;
      if (!result.role || result.role.length === 0) {
        result.role = ['schooladmin'];
      }
    }
    
    return result;
  }, [filter, isRegionAdmin, isSectorAdmin, regionId, sectorId]);

  // Cache key-i hazırla
  const cacheKey = useMemo(() => {
    return `${USERS_CACHE_KEY}_${JSON.stringify(normalizedFilter)}_page_${currentPage}`;
  }, [normalizedFilter, currentPage]);

  // İstifadəçi listini almaq üçün keşlənmiş sorğu
  const {
    data: usersData,
    isLoading: loading,
    error,
    refetch
  } = useCachedQuery<{users: FullUserData[], totalCount: number}>({
    queryKey: ['users', normalizedFilter, currentPage],
    queryFn: async () => {
      // Edge funksiya və ya birbaşa API sorğusu ilə verilənləri əldə et
      try {
        console.log('Fetching users with filter:', JSON.stringify(normalizedFilter));
        
        // Auth headers hazırla
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
        
        // Edge funksiyası ilə istifadəçiləri əldə et
        const { data, error } = await supabase.functions.invoke('get-all-users-with-roles', {
          body: {
            filter: normalizedFilter,
            page: currentPage,
            pageSize: USER_PAGE_SIZE
          }
        });

        if (error) throw error;
        
        if (!data || !Array.isArray(data.users)) {
          throw new Error('Invalid response format');
        }
        
        // Client-side axtarışı tətbiq et
        let filteredUsers = data.users;
        if (filter.search && filter.search.trim() !== '') {
          const searchTerm = filter.search.trim().toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            (user.full_name?.toLowerCase().includes(searchTerm)) || 
            (user.email?.toLowerCase().includes(searchTerm)) || 
            (user.phone?.toLowerCase().includes(searchTerm)) ||
            (user.role?.toLowerCase().includes(searchTerm))
          );
        }
        
        return { 
          users: filteredUsers as FullUserData[],
          totalCount: data.totalCount || filteredUsers.length
        };
      } catch (err) {
        console.error('Error in fetchUsers:', err);
        throw err;
      }
    },
    queryOptions: {
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5, // 5 dəqiqə
      retry: 1,
      onError: (err: any) => {
        toast.error(`İstifadəçi məlumatları əldə edilərkən xəta: ${err.message}`);
      }
    },
    cacheConfig: {
      expiryInMinutes: 5 // 5 dəqiqə keşləmə
    }
  });

  // Toplam səhifə sayını hesabla
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((usersData?.totalCount || 0) / USER_PAGE_SIZE));
  }, [usersData?.totalCount]);

  // Filtri yenilə
  const updateFilter = useCallback((newFilter: Partial<UserFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(1); // Filtir dəyişdikdə 1-ci səhifəyə qayıt
  }, []);

  // Filtri sıfırla
  const resetFilter = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  // Sorğu nəticələrini əldə et
  useEffect(() => {
    if (usersData?.totalCount !== undefined) {
      setTotalCount(usersData.totalCount);
    }
  }, [usersData]);

  // İstifadəçi əlavə etmə/silmə/yeniləmə sonrası keşi təmizlə
  const invalidateUsersCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }, [queryClient]);

  // Keşi təmizlə və yenidən sorğu göndər
  const refreshList = useCallback(() => {
    invalidateUsersCache();
    refetch();
  }, [invalidateUsersCache, refetch]);

  return {
    users: usersData?.users || [],
    loading,
    error: error as Error,
    filter,
    updateFilter,
    resetFilter,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    refetch: refreshList
  };
};
