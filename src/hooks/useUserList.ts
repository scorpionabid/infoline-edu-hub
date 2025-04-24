import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { FullUserData } from '@/types/user';

export const useUserList = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    role: '',
    sectorId: '',
    regionId: '',
    search: ''
  });

  const { isSectorAdmin, sectorId } = usePermissions();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('user_roles')
        .select(`
          *,
          profiles!inner(*)
        `, { count: 'exact' });

      // Sektoradmin üçün filtirləmə
      if (isSectorAdmin && sectorId) {
        query = query
          .eq('sector_id', sectorId)
          .eq('role', 'schooladmin');
      } 
      // Digər filtirlər
      else {
        if (filter.role) query = query.eq('role', filter.role);
        if (filter.sectorId) query = query.eq('sector_id', filter.sectorId);
        if (filter.regionId) query = query.eq('region_id', filter.regionId);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      const formattedUsers = data?.map(item => ({
        id: item.id,
        email: item.profiles?.email || '',
        full_name: item.profiles?.full_name || '',
        role: item.role,
        region_id: item.region_id,
        sector_id: item.sector_id,
        school_id: item.school_id,
        status: item.profiles?.status || 'active',
        phone: item.profiles?.phone || '',
        position: item.profiles?.position || '',
        language: item.profiles?.language || 'az',
        avatar: item.profiles?.avatar || '',
        last_login: item.profiles?.last_login || '',
        created_at: item.profiles?.created_at || '',
        updated_at: item.profiles?.updated_at || '',
        name: item.profiles?.full_name || '',
        regionId: item.region_id,
        sectorId: item.sector_id,
        schoolId: item.school_id,
        lastLogin: item.profiles?.last_login || '',
        createdAt: item.profiles?.created_at || '',
        updatedAt: item.profiles?.updated_at || '',
        twoFactorEnabled: false,
        notificationSettings: {
          email: true,
          system: true
        }
      })) || [];

      setUsers(formattedUsers);
      setTotalCount(count || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filter, isSectorAdmin, sectorId]);

  const updateFilter = useCallback((newFilter: typeof filter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({
      role: '',
      sectorId: '',
      regionId: '',
      search: ''
    });
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, currentPage]);

  return {
    users,
    loading,
    error,
    filter,
    updateFilter,
    resetFilter,
    totalCount,
    totalPages: Math.ceil(totalCount / 10),
    currentPage,
    setCurrentPage,
    fetchUsers
  };
};
