
import { useState, useCallback } from 'react';
import { useUserFetch } from './useUserFetch';
import { UserFilter } from '@/types/user';

export const useUsers = () => {
  const [filters, setFilters] = useState<UserFilter>({});
  const { users, loading, error, totalCount, fetchUsers } = useUserFetch();

  const updateFilters = useCallback((newFilters: UserFilter) => {
    setFilters(newFilters);
    const validRoles = newFilters.role?.filter(role => 
      ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(role)
    );
    fetchUsers({ ...newFilters, role: validRoles }, 1, 20);
  }, [fetchUsers]);

  const refreshUsers = useCallback(() => {
    fetchUsers(filters);
  }, [fetchUsers, filters]);

  return {
    users,
    loading,
    error,
    totalCount,
    filters,
    updateFilters,
    refreshUsers
  };
};
