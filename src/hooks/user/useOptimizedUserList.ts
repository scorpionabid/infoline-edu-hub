
import { useState, useCallback } from 'react';
import { fetchUserData } from './userFetchService';
import { FullUserData, UserFilter } from '@/types/user';
import { usePermissions } from '@/hooks/auth/usePermissions';

export const useOptimizedUserList = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const { userRole, regionId, sectorId } = usePermissions();

  const fetchUsers = useCallback(async (
    filters: UserFilter = {}, 
    page: number = 1, 
    limit: number = 20
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fix type casting for role filter
      const processedFilters: UserFilter = {
        ...filters,
        role: filters.role ? (Array.isArray(filters.role) ? filters.role : [filters.role]) : undefined,
        status: filters.status ? (Array.isArray(filters.status) ? filters.status : [filters.status]) : undefined
      };

      const result = await fetchUserData(
        processedFilters, 
        page, 
        limit, 
        userRole || 'schooladmin', 
        regionId, 
        sectorId
      );
      
      setUsers(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userRole, regionId, sectorId]);

  const refreshUsers = useCallback(() => {
    return fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    totalCount,
    fetchUsers,
    refreshUsers
  };
};
