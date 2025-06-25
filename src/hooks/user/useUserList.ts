import { useState, useEffect } from 'react';
import { useUsers } from './useUsers';
import { UserFilter } from '@/types/user';

// Transform UserFilter to the format expected by useUsers
const transformFilters = (filters: UserFilter) => {
  const transformed: { role?: string; status?: string; searchTerm?: string } = {};
  
  if (filters.role) {
    // Convert array to first item or keep string as is
    transformed.role = Array.isArray(filters.role) ? filters.role[0] : filters.role;
  }
  
  if (filters.status) {
    // Convert array to first item or keep string as is
    transformed.status = Array.isArray(filters.status) ? filters.status[0] : filters.status;
  }
  
  if (filters.search) {
    transformed.searchTerm = filters.search;
  }
  
  return transformed;
};

export const useUserList = (initialFilters: UserFilter = {}) => {
  const [filters, setFilters] = useState<UserFilter>(initialFilters);
  const { users, isLoading, error, refetch } = useUsers(transformFilters(filters));

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
