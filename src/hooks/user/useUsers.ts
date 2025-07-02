
import { useQuery } from '@tanstack/react-query';
import { userFetchService } from './userFetchService';
import { FullUserData } from '@/types/user';

interface UseUsersOptions {
  role?: string;
  status?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', options],
    queryFn: async () => {
      // Fetch all users first
      const allUsers = await userFetchService.fetchAllUsers();
      
      // Apply filters
      let filtered = [...allUsers];
      const { role, status, searchTerm, sortField = 'created_at', sortDirection = 'desc' } = options;
      
      // Apply role filter
      if (role && role !== 'all_roles') {
        filtered = filtered.filter(user => user.role === role);
      }
      
      // Apply status filter
      if (status && status !== 'all_statuses') {
        filtered = filtered.filter(user => user.status === status);
      }
      
      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(user => 
          (user.full_name?.toLowerCase().includes(searchLower) ||
           user.email?.toLowerCase().includes(searchLower) ||
           user.phone?.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        let aValue = a[sortField as keyof typeof a];
        let bValue = b[sortField as keyof typeof b];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
        
        // Handle dates
        if (sortField === 'created_at' || sortField === 'last_login') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }
        
        // Handle strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        // Handle numbers
        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
      
      // Apply pagination
      const { page = 1, pageSize = 10 } = options;
      const startIndex = (page - 1) * pageSize;
      const paginatedUsers = filtered.slice(startIndex, startIndex + pageSize);
      
      return {
        users: paginatedUsers,
        totalCount: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    users: data?.users || [],
    totalCount: data?.totalCount || 0,
    currentPage: data?.page || 1,
    pageSize: data?.pageSize || 10,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refetch
  };
};
