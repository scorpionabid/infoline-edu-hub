
import { useState, useCallback } from 'react';
import { userFetchService } from './userFetchService';
import { FullUserData, UserFilter } from '@/types/user';
import { usePermissions } from '@/hooks/auth/usePermissions';

// Create a fetchUserData function using the existing userFetchService
const fetchUserData = async (
  filters: UserFilter = {}, 
  page: number = 1, 
  limit: number = 20, 
  userRole: string = 'schooladmin', 
  regionId?: string, 
  sectorId?: string
) => {
  try {
    // For now, we'll use the existing fetchAllUsers and filter client-side
    const allUsers = await userFetchService.fetchAllUsers();
    
    // Apply filters
    let filteredUsers = allUsers;
    
    if (filters.role && Array.isArray(filters.role) && filters.role.length > 0) {
      filteredUsers = filteredUsers.filter(user => filters.role!.includes(user.role));
    } else if (filters.role && typeof filters.role === 'string') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      filteredUsers = filteredUsers.filter(user => filters.status!.includes(user.status));
    } else if (filters.status && typeof filters.status === 'string') {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role-based filtering
    if (userRole === 'regionadmin' && regionId) {
      filteredUsers = filteredUsers.filter(user => user.region_id === regionId);
    } else if (userRole === 'sectoradmin' && sectorId) {
      filteredUsers = filteredUsers.filter(user => user.sector_id === sectorId);
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);
    
    return {
      data: paginatedUsers,
      count: filteredUsers.length
    };
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    throw error;
  }
};

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
