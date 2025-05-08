
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserFilter } from '@/types/user';

export const useUsers = (initialFilter: UserFilter = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>(initialFilter);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchUsers = async (filter: UserFilter) => {
    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('user_roles')
        .select(`
          *,
          profiles!user_id(email, full_name, phone, position, language, status, created_at, updated_at),
          regions(name),
          sectors(name),
          schools(name)
        `, { count: 'exact' });
      
      // Apply filters
      if (filter.role && filter.role.length) {
        if (Array.isArray(filter.role)) {
          query = query.in('role', filter.role);
        } else {
          query = query.eq('role', filter.role);
        }
      }
      
      if (filter.status && filter.status.length && filter.status !== "") {
        if (Array.isArray(filter.status)) {
          query = query.in('profiles.status', filter.status);
        } else {
          query = query.eq('profiles.status', filter.status);
        }
      }
      
      if (filter.regionId) {
        query = query.eq('region_id', filter.regionId);
      }
      
      if (filter.sectorId) {
        query = query.eq('sector_id', filter.sectorId);
      }
      
      if (filter.schoolId) {
        query = query.eq('school_id', filter.schoolId);
      }
      
      if (filter.search) {
        query = query.or(`or(profiles.email.ilike.%${filter.search}%,profiles.full_name.ilike.%${filter.search}%)`);
      }
      
      // Pagination
      const page = filter.page || 1;
      const limit = filter.limit || 10;
      const from = (page - 1) * limit;
      const to = page * limit - 1;
      
      query = query.range(from, to);
      query = query.order('profiles.created_at', { ascending: false });
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Process data
      const processedUsers = data?.map(item => {
        const profile = item.profiles || {};
        return {
          id: item.user_id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          name: profile.full_name || '',
          role: item.role,
          region_id: item.region_id || '',
          regionId: item.region_id || '',
          sector_id: item.sector_id || '',
          sectorId: item.sector_id || '',
          school_id: item.school_id || '',
          schoolId: item.school_id || '',
          phone: profile.phone || '',
          position: profile.position || '',
          language: profile.language || '',
          status: profile.status || '',
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || '',
          region_name: item.regions?.name || '',
          sector_name: item.sectors?.name || '',
          school_name: item.schools?.name || ''
        };
      });
      
      setUsers(processedUsers || []);
      setTotalRecords(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (newFilter: Partial<UserFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    fetchUsers(updatedFilter);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    updateFilter({ page });
  };

  useEffect(() => {
    fetchUsers(filter);
  }, []);

  return {
    users,
    loading,
    error,
    filter,
    updateFilter,
    totalPages,
    currentPage,
    totalRecords,
    handlePageChange,
    refetch: () => fetchUsers(filter)
  };
};

export default useUsers;
