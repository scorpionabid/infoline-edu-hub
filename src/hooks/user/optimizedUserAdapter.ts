
import { useOptimizedUserList } from './useOptimizedUserList';
import { UserFilter } from '@/types/user';

// Adapter to bridge the old interface with the new optimized hook
export const useOptimizedUserAdapter = (initialFilters?: UserFilter) => {
  const {
    users,
    loading,
    error,
    totalCount,
    hasMore,
    fetchUsers,
    resetUsers,
    refetch
  } = useOptimizedUserList();

  return {
    users,
    loading,
    error,
    totalCount,
    hasMore,
    fetchUsers,
    resetUsers,
    refetch
  };
};

export default useOptimizedUserAdapter;
