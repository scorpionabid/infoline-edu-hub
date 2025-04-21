
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserFilter } from '../useUserList';
import { FullUserData } from '@/types/user';

export const useUserFetch = (
  filter: UserFilter,
  currentPage: number,
  pageSize: number
) => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // İstifadəçiləri əldə etmək üçün filtrlərə uyğun sorğu yaradırıq
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          position,
          avatar,
          language,
          status,
          last_login,
          created_at,
          updated_at
        `, { count: 'exact' });

      // Axtarış filtri
      if (filter.search) {
        query = query.or(`email.ilike.%${filter.search}%,full_name.ilike.%${filter.search}%`);
      }

      // Status filtri
      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      // Səhifələmə
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Sorğunu yerinə yetir
      const { data, error, count } = await query;

      if (error) throw error;

      // İstifadəçi rollarını əldə et
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Rol filtri
      let filteredUsers = data;
      if (filter.role) {
        filteredUsers = data.filter(user => {
          const userRole = rolesData.find(role => role.user_id === user.id);
          return userRole?.role === filter.role;
        });
      }

      // Region filtri
      if (filter.region) {
        filteredUsers = filteredUsers.filter(user => {
          const userRole = rolesData.find(role => role.user_id === user.id);
          return userRole?.region_id === filter.region;
        });
      }

      // Sektor filtri
      if (filter.sector) {
        filteredUsers = filteredUsers.filter(user => {
          const userRole = rolesData.find(role => role.user_id === user.id);
          return userRole?.sector_id === filter.sector;
        });
      }

      // Məktəb filtri
      if (filter.school) {
        filteredUsers = filteredUsers.filter(user => {
          const userRole = rolesData.find(role => role.user_id === user.id);
          return userRole?.school_id === filter.school;
        });
      }

      // İstifadəçilərə rolları əlavə et
      const usersWithRoles = filteredUsers.map(user => {
        const userRole = rolesData.find(role => role.user_id === user.id);
        return {
          ...user,
          role: userRole?.role || 'user',
          region_id: userRole?.region_id,
          sector_id: userRole?.sector_id,
          school_id: userRole?.school_id,
          regionId: userRole?.region_id,
          sectorId: userRole?.sector_id,
          schoolId: userRole?.school_id,
          fullName: user.full_name || ''
        } as FullUserData;
      });

      setUsers(usersWithRoles);
      if (count !== null) {
        setTotalCount(count);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, pageSize]);

  // Filter və ya səhifə dəyişdikdə sorğunu yenilə
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    setUsers,
    totalCount,
    setTotalCount
  };
};
