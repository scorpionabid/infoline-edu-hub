
import { useOptimizedUserList } from './useOptimizedUserList';
import { FullUserData, UserFilter } from '@/types/user';

export const useOptimizedUserAdapter = () => {
  const { users, loading, error, totalCount, fetchUsers, refreshUsers } = useOptimizedUserList();

  return {
    users,
    loading,
    error,
    totalCount,
    // Add missing properties that were expected
    hasMore: false, // Simple implementation
    fetchUsers,
    resetUsers: refreshUsers, // Alias
    refetch: refreshUsers, // Alias
    refreshUsers
  };
};

export default useOptimizedUserAdapter;
