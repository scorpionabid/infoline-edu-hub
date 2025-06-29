
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
        // Always get all users first to have maximum flexibility
        console.log('🔍 useAssignableUsers - Fetching all users first');
        const allUsers = await userFetchService.getAllUsers();
        console.log('✅ useAssignableUsers - Got all users:', allUsers.length);

        if (!allUsers || allUsers.length === 0) {
          console.warn('⚠️ useAssignableUsers - No users found in database');
          return [];
        }

        // Apply basic filtering - exclude superadmins and invalid users
        const validUsers = allUsers.filter(user => {
          // Basic validation
          if (!user || !user.id || !user.email) {
            console.log('❌ useAssignableUsers - Invalid user:', user);
            return false;
          }

          // Exclude superadmins from assignment
          const userRoleLower = user.role?.toLowerCase();
          if (userRoleLower === 'superadmin') {
            console.log('❌ useAssignableUsers - Excluding superadmin:', user.email);
            return false;
          }

          return true;
        });

        console.log('✅ useAssignableUsers - Valid users after basic filtering:', validUsers.length);

        // For SuperAdmin without regionId, return all valid users
        if (isSuperAdmin && !regionId) {
          console.log('✅ useAssignableUsers - SuperAdmin mode: returning all valid users');
          return validUsers;
        }

        // Apply region-based filtering only if regionId is provided
        if (regionId) {
          const regionFilteredUsers = validUsers.filter(user => {
            // Include users that:
            // 1. Have the same region_id
            // 2. Have no region_id (can be assigned anywhere)
            // 3. Have no role (can be assigned)
            // 4. Have 'Standard' role (unassigned users)
            const matches = (
              user.region_id === regionId ||
              !user.region_id ||
              !user.role ||
              user.role === 'Standard'
            );

            if (matches) {
              console.log('✅ useAssignableUsers - User matches region filter:', {
                name: user.full_name,
                email: user.email,
                role: user.role,
                region_id: user.region_id,
                target_region: regionId
              });
            } else {
              console.log('❌ useAssignableUsers - User filtered out:', {
                name: user.full_name,
                email: user.email,
                role: user.role,
                region_id: user.region_id,
                target_region: regionId,
                reason: 'Region mismatch'
              });
            }

            return matches;
          });

          console.log('✅ useAssignableUsers - After region filtering:', {
            total: validUsers.length,
            filtered: regionFilteredUsers.length,
            regionId
          });

          return regionFilteredUsers;
        }

        // If no regionId provided, return all valid users
        console.log('✅ useAssignableUsers - No regionId provided, returning all valid users');
        return validUsers;
        
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
    regionId,
    sampleUsers: safeUsers.slice(0, 3).map(u => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      role: u.role
    }))
  });

  return {
    users: safeUsers,
    isLoading,
    error,
    refetch
  };
};

export default useAssignableUsers;
