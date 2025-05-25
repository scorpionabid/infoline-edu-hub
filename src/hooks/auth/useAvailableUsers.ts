
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { User } from '@/types/auth';

export interface UserFilter {
  role?: string;
  region_id?: string;
  sector_id?: string;
  search?: string;
}

export const useAvailableUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>({});
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const pageSize = 10;

  const fetchUsers = async (page = 1, currentFilter = filter) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role,
            region_id,
            sector_id,
            school_id
          )
        `, { count: 'exact' });

      // Apply filters based on current user's role
      if (user?.role === 'regionadmin' && user.region_id) {
        query = query.eq('user_roles.region_id', user.region_id);
      } else if (user?.role === 'sectoradmin' && user.sector_id) {
        query = query.eq('user_roles.sector_id', user.sector_id);
      }

      // Apply additional filters
      if (currentFilter.role) {
        query = query.eq('user_roles.role', currentFilter.role);
      }
      if (currentFilter.region_id) {
        query = query.eq('user_roles.region_id', currentFilter.region_id);
      }
      if (currentFilter.sector_id) {
        query = query.eq('user_roles.sector_id', currentFilter.sector_id);
      }
      if (currentFilter.search) {
        query = query.or(`full_name.ilike.%${currentFilter.search}%,email.ilike.%${currentFilter.search}%`);
      }

      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      // Transform data to User format
      const transformedUsers: User[] = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        full_name: profile.full_name || '',
        role: profile.user_roles?.[0]?.role || 'schooladmin',
        region_id: profile.user_roles?.[0]?.region_id,
        sector_id: profile.user_roles?.[0]?.sector_id,
        school_id: profile.user_roles?.[0]?.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language,
        avatar: profile.avatar,
        status: profile.status,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }));

      setUsers(transformedUsers);
      setTotalRecords(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));
      setCurrentPage(page);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (newFilter: Partial<UserFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    fetchUsers(1, updatedFilter);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const refetch = () => {
    return fetchUsers(currentPage);
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

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
    refetch,
    fetchUsers
  };
};
