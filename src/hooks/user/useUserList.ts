
import { useState, useEffect } from 'react';
import { useUsers } from './useUsers';
import { UserFilter } from '@/types/user';

export const useUserList = (initialFilters: UserFilter = {}) => {
  const [filters, setFilters] = useState<UserFilter>(initialFilters);
  const { users, isLoading, error, refetch } = useUsers(filters);

  const applyFilters = (newFilters: UserFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    users,
    loading: isLoading,
    error,
    totalCount: users.length,
    filters,
    applyFilters,
    resetFilters,
    refreshUsers: refetch,
    updateFilters: applyFilters
  };
};
