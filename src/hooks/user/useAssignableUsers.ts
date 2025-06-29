
import { useQuery } from '@tanstack/react-query';
import { userFetchService } from '@/services/users/userFetchService';
import { FullUserData } from '@/types/user';
import { usePermissions } from '@/hooks/auth/usePermissions';

/**
 * Hook for fetching users that can be assigned to roles based on region
 * 
 * @param regionId - Region ID to filter assignable users for
 * @returns Object containing assignable users and query state
 */
export const useAssignableUsers = (regionId?: string) => {
  const { userRole, isSuperAdmin } = usePermissions();

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['assignable-users', regionId, userRole],
    queryFn: async () => {
      console.log('🔍 useAssignableUsers - Starting fetch with:', {
        regionId,
        userRole,
        isSuperAdmin
      });

      try {
        // For SuperAdmin without regionId, get all users
        if (isSuperAdmin && !regionId) {
          console.log('🔍 useAssignableUsers - SuperAdmin mode: fetching all users');
          const allUsers = await userFetchService.getAllUsers();
          console.log('✅ useAssignableUsers - SuperAdmin got users:', allUsers.length);
          return allUsers;
        }

        // For SuperAdmin with regionId or other roles, try region-specific fetch
        if (regionId) {
          console.log('🔍 useAssignableUsers - Trying region-specific fetch for region:', regionId);
          
          try {
            const regionUsers = await userFetchService.getAssignableUsersForRegion(regionId);
            console.log('✅ useAssignableUsers - Region-specific fetch successful:', regionUsers.length);
            return regionUsers;
          } catch (rpcError) {
            console.warn('⚠️ useAssignableUsers - RPC failed, falling back to client-side filtering:', rpcError);
          }
        }

        // Fallback: Get all users and filter client-side
        console.log('🔍 useAssignableUsers - Using fallback: getAllUsers with client-side filtering');
        const allUsers = await userFetchService.getAllUsers();
        console.log('📋 useAssignableUsers - Got all users for filtering:', allUsers.length);

        if (!regionId) {
          console.log('✅ useAssignableUsers - No regionId provided, returning all users');
          return allUsers;
        }

        // Client-side filtering by region
        const filteredUsers = allUsers.filter(user => {
          // SuperAdmin users should be excluded from assignment
          const userRole = user.role?.toLowerCase();
          if (userRole === 'superadmin') {
            return false;
          }

          // Include users that:
          // 1. Have the same region_id
          // 2. Have no region_id (can be assigned anywhere)
          // 3. Have no role (can be assigned)
          const matches = (
            user.region_id === regionId ||
            !user.region_id ||
            !user.role
          );

          if (matches) {
            console.log('✅ useAssignableUsers - User matches filter:', {
              name: user.full_name,
              email: user.email,
              role: user.role,
              region_id: user.region_id,
              target_region: regionId
            });
          }

          return matches;
        });

        console.log('✅ useAssignableUsers - Client-side filtering complete:', {
          total: allUsers.length,
          filtered: filteredUsers.length,
          regionId
        });

        return filteredUsers;
        
      } catch (error) {
        console.error('❌ useAssignableUsers - Error in queryFn:', error);
        throw error;
      }
    },
    enabled: true, // Always enable the query
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      console.log('🔄 useAssignableUsers - Query retry:', { failureCount, error });
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Additional safety filtering
  const safeUsers = users.filter(user => {
    if (!user || !user.id) return false;
    
    // Filter out superadmins for additional safety
    const userRole = user.role?.toLowerCase();
    return !userRole || !userRole.includes('superadmin');
  });

  console.log('🎯 useAssignableUsers - Final result:', {
    originalCount: users.length,
    safeCount: safeUsers.length,
    isLoading,
    hasError: !!error,
    regionId
  });

  return {
    users: safeUsers,
    isLoading,
    error,
    refetch
  };
};

export default useAssignableUsers;
