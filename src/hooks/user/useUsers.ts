
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userFetchService } from './userFetchService';
import { FullUserData } from '@/types/user'; // Use consistent user types

export const useUsers = (filters?: { role?: string; status?: string; searchTerm?: string }) => {
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: userFetchService.fetchAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredUsers = useMemo(() => {
    if (!filters) return users;

    return users.filter((user: FullUserData) => {
      const roles = Array.isArray(filters.role) ? filters.role : filters.role ? [filters.role] : [];
      
      if (roles.length > 0 && user.role && !roles.includes(user.role)) {
        return false;
      }
      
      if (filters.status && user.status !== filters.status) {
        return false;
      }
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [users, filters]);

  return {
    users: filteredUsers,
    isLoading,
    error,
    refetch
  };
};
