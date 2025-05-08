
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserFilter } from '@/types/user';

export const useOptimizedUserList = (initialFilters?: UserFilter) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilter>(initialFilters || {});
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUserCount = useCallback(async (filter: UserFilter) => {
    try {
      let query = supabase.from('users').select('*', { count: 'exact', head: true });

      // Apply filters
      if (filter.role && Array.isArray(filter.role) && filter.role.length > 0) {
        query = query.in('role', filter.role);
      } else if (filter.role) {
        query = query.eq('role', filter.role);
      }
      
      if (filter.status && Array.isArray(filter.status) && filter.status.length > 0) {
        query = query.in('status', filter.status);
      } else if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.regionId) query = query.eq('region_id', filter.regionId);
      if (filter.sectorId) query = query.eq('sector_id', filter.sectorId);
      if (filter.schoolId) query = query.eq('school_id', filter.schoolId);
      
      if (filter.search) {
        query = query.or(`full_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
      }

      const { count, error } = await query;

      if (error) throw error;
      if (count !== null) setTotalUsers(count);
    } catch (err) {
      console.error('Error fetching user count:', err);
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1, pageSize = 10, filter: UserFilter = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate offset for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Start building the query
      let query = supabase
        .from('users')
        .select(`
          *,
          regions:region_id (id, name),
          sectors:sector_id (id, name),
          schools:school_id (id, name)
        `)
        .range(from, to);

      // Apply filters
      if (filter.role && Array.isArray(filter.role) && filter.role.length > 0) {
        query = query.in('role', filter.role);
      } else if (filter.role) {
        query = query.eq('role', filter.role);
      }

      if (filter.status && Array.isArray(filter.status) && filter.status.length > 0) {
        query = query.in('status', filter.status);
      } else if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.regionId) query = query.eq('region_id', filter.regionId);
      if (filter.sectorId) query = query.eq('sector_id', filter.sectorId);
      if (filter.schoolId) query = query.eq('school_id', filter.schoolId);
      
      if (filter.search) {
        query = query.or(`full_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
      }

      // Apply sorting
      if (filter.sortBy) {
        const sortOrder = filter.sortOrder || 'asc';
        query = query.order(filter.sortBy, { ascending: sortOrder === 'asc' });
      } else {
        // Default sort by creation date
        query = query.order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Format user data
      const formattedUsers = data?.map(user => ({
        ...user,
        regionName: user.regions?.name,
        sectorName: user.sectors?.name, 
        schoolName: user.schools?.name
      })) || [];

      setUsers(formattedUsers);
      setCurrentPage(page);

      // Update total count
      await fetchUserCount(filter);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filters, fetchUserCount]);

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers(currentPage, pageSize);
  }, [currentPage, pageSize, fetchUsers]);

  return {
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    pageSize,
    setPageSize,
    setCurrentPage,
    fetchUsers,
    filters,
    setFilters
  };
};

export default useOptimizedUserList;
