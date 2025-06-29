
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
    console.log('\n=== FILTERING USERS ===' );
    console.log('Filters applied:', filters);
    console.log('Total users before filtering:', users.length);
    
    if (!filters) {
      console.log('No filters applied, returning all users');
      return users;
    }

    const filtered = users.filter((user: FullUserData) => {
      // Role filter
      if (filters.role && filters.role !== 'all_roles') {
        if (user.role !== filters.role) {
          console.log(`❌ User ${user.full_name} filtered out by role: ${user.role} !== ${filters.role}`);
          return false;
        }
        console.log(`✅ User ${user.full_name} matches role filter: ${user.role}`);
      }
      
      // Status filter 
      if (filters.status && filters.status !== 'all_statuses') {
        if (user.status !== filters.status) {
          console.log(`❌ User ${user.full_name} filtered out by status: ${user.status} !== ${filters.status}`);
          return false;
        }
        console.log(`✅ User ${user.full_name} matches status filter: ${user.status}`);
      }
      
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = (
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) {
          console.log(`❌ User ${user.full_name} filtered out by search: ${filters.searchTerm}`);
          return false;
        }
        console.log(`✅ User ${user.full_name} matches search filter: ${filters.searchTerm}`);
      }
      
      console.log(`✅ User ${user.full_name} passed all filters`);
      return true;
    });
    
    console.log(`📊 FILTER RESULT: ${filtered.length} users out of ${users.length}`);
    console.log('=== END FILTERING ===\n');
    
    return filtered;
  }, [users, filters]);

  return {
    users: filteredUsers,
    isLoading,
    error,
    refetch
  };
};
