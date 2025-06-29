import { useQuery } from '@tanstack/react-query';
import { userFetchService } from '@/services/users/userFetchService';
import { FullUserData } from '@/types/user';

/**
 * Hook for fetching users that can be assigned to roles based on region
 * 
 * @param regionId - Region ID to filter assignable users for
 * @returns Object containing assignable users and query state
 */
export const useAssignableUsers = (regionId?: string) => {
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['assignable-users', regionId],
    queryFn: async () => {
      if (!regionId) {
        // If no regionId provided, fallback to getAllUsers (for superadmin)
        return userFetchService.getAllUsers();
      }
      
      try {
        // Try the new function first
        return await userFetchService.getAssignableUsersForRegion(regionId);
      } catch (error) {
        console.warn('⚠️ Fallback: Using getAllUsers due to RPC error:', error);
        // Fallback to getAllUsers and filter client-side
        const allUsers = await userFetchService.getAllUsers();
        return allUsers.filter(user => {
          // Filter logic similar to the database function
          const userRole = user.role?.toLowerCase();
          if (userRole === 'superadmin') return false;
          
          return (
            user.region_id === regionId ||
            !user.region_id ||
            !user.role
          );
        });
      }
    },
    enabled: !!regionId, // Only enable query when regionId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter out superadmin users from the results for additional safety
  const filteredUsers = users.filter(user => {
    // Additional safety: filter out superadmins and handle null roles properly
    const userRole = user.role?.toLowerCase();
    return !userRole || !userRole.includes('superadmin');
  });

  return {
    users: filteredUsers,
    isLoading,
    error,
    refetch
  };
};

export default useAssignableUsers;