import { useState, useEffect, useMemo } from 'react';
import { useUsers } from './useUsers';
import { UserFilter } from '@/types/user';

// Transform UserFilter to the format expected by useUsers
const transformFilters = (filters: UserFilter) => {
  const transformed: { role?: string; status?: string; searchTerm?: string } = {};
  
  if (filters.role && !Array.isArray(filters.role)) {
    transformed.role = filters.role;
  } else if (Array.isArray(filters.role) && filters.role.length > 0) {
    transformed.role = filters.role[0];
  }
  
  if (filters.status && !Array.isArray(filters.status)) {
    transformed.status = filters.status;
  } else if (Array.isArray(filters.status) && filters.status.length > 0) {
    transformed.status = filters.status[0];
  }
  
  if (filters.search) {
    transformed.searchTerm = filters.search;
  }
  
  return transformed;
};

export const useUserList = (externalFilters: UserFilter = {}) => {
  const [localFilters, setLocalFilters] = useState<UserFilter>(externalFilters);
  
  // Xarici filterlər dəyişdikdə lokal state-i yenilə
  useEffect(() => {
    console.log('External filters changed:', externalFilters);
    setLocalFilters(externalFilters);
  }, [JSON.stringify(externalFilters)]);
  
  // Transformed filters for the useUsers hook
  const transformedFilters = useMemo(() => transformFilters(localFilters), [localFilters]);
  
  const { users, isLoading, error, refetch } = useUsers(transformedFilters);

  const applyFilters = (newFilters: UserFilter) => {
    console.log('Applying filters:', newFilters);
    setLocalFilters(newFilters);
  };

  const resetFilters = () => {
    setLocalFilters({});
  };

  // Debug log
  useEffect(() => {
    console.log('Current filters in useUserList:', localFilters);
    console.log('Transformed filters:', transformedFilters);
    console.log('Total users found:', users.length);
  }, [localFilters, transformedFilters, users.length]);

  return {
    users,
    loading: isLoading,
    error,
    totalCount: users.length,
    filters: localFilters,
    applyFilters,
    resetFilters,
    refreshUsers: refetch,
    updateFilters: applyFilters
  };
};
