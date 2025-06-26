
import { useState, useCallback } from 'react';
import { userFetchService, fetchUserData } from './userFetchService';
import { FullUserData as AuthFullUserData } from '@/types/auth';
import { UserFilter } from '@/types/user';
import { usePermissions } from '@/hooks/auth/usePermissions';

export const useOptimizedUserList = () => {
  const [users, setUsers] = useState<AuthFullUserData[]>([]);
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
      const result = await fetchUserData(
        filters, 
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
