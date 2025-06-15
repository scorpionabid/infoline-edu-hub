
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
      // Process filters to handle array types properly
      const processedFilters: UserFilter = {
        ...filters,
        role: Array.isArray(filters.role) ? filters.role[0] : filters.role,
        status: Array.isArray(filters.status) ? filters.status[0] : filters.status
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
