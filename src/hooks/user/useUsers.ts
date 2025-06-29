
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
    
    // Debug: Log all user roles
    console.log('👥 All user roles:', users.map(u => ({ name: u.full_name, role: u.role, status: u.status })));
    
    if (!filters) {
      console.log('No filters applied, returning all users');
      return users;
    }

    // Check if we have sectoradmin filter specifically
    if (filters.role === 'sectoradmin') {
      console.log('🔍 DEBUGGING SECTORADMIN FILTER');
      const sectorAdmins = users.filter(u => u.role === 'sectoradmin');
      console.log('Found sectoradmins:', sectorAdmins.map(u => ({ name: u.full_name, email: u.email, role: u.role })));
    }

    const filtered = users.filter((user: FullUserData) => {
      // Enhanced role filter with normalization
      if (filters.role && filters.role !== 'all_roles') {
        const normalizedUserRole = (user.role || '').toLowerCase().trim();
        const normalizedFilterRole = (filters.role || '').toLowerCase().trim();
        
        if (normalizedUserRole !== normalizedFilterRole) {
          console.log(`❌ User ${user.full_name} filtered out by role: "${user.role}" (normalized: "${normalizedUserRole}") !== "${filters.role}" (normalized: "${normalizedFilterRole}")`);
          return false;
        }
        console.log(`✅ User ${user.full_name} matches role filter: "${user.role}"`);
      }
      
      // Enhanced status filter 
      if (filters.status && filters.status !== 'all_statuses') {
        const normalizedUserStatus = (user.status || '').toLowerCase().trim();
        const normalizedFilterStatus = (filters.status || '').toLowerCase().trim();
        
        if (normalizedUserStatus !== normalizedFilterStatus) {
          console.log(`❌ User ${user.full_name} filtered out by status: "${user.status}" !== "${filters.status}"`);
          return false;
        }
        console.log(`✅ User ${user.full_name} matches status filter: "${user.status}"`);
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
    
    // Special debug for sectoradmin filter
    if (filters.role === 'sectoradmin') {
      console.log('🎯 SECTORADMIN FILTER RESULTS:');
      console.log('Filtered users:', filtered.map(u => ({ name: u.full_name, email: u.email, role: u.role })));
    }
    
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
