
import { useState, useEffect } from 'react';
import { useUsers } from './useUsers';
import { UserFilter } from '@/types/user';

export const useUserList = (initialFilters: UserFilter = {}) => {
  const [filters, setFilters] = useState<UserFilter>(initialFilters);
  const { users, loading, error, totalCount, refreshUsers, updateFilters } = useUsers();

  useEffect(() => {
    updateFilters(filters);
  }, [filters, updateFilters]);

  const applyFilters = (newFilters: UserFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    users,
    loading,
    error,
    totalCount,
    filters,
    applyFilters,
    resetFilters,
    refreshUsers
  };
};
