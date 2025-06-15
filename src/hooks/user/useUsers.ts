import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserFilter, UserRole, UserStatus } from '@/types/user';
import { safeAdminRoleFilter, safeUserStatusFilter } from '@/utils/buildFixes';

export const useUsers = (initialFilter: UserFilter = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>(initialFilter);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchUsers = useCallback(async (currentFilter: UserFilter) => {
    try {
      setLoading(true);
      setError(null);

      console.log('İstifadəçilər üçün filtrlər:', currentFilter);

      // Build query - düzgün FK join ilə
      let query = supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id(email, full_name, phone, position, language, status, created_at, updated_at),
          regions:region_id(name),
          sectors:sector_id(name),
          schools:school_id(name)
        `, { count: 'exact' });
      
      // Apply filters with safe type casting - fix enum comparison
      if (currentFilter.role && !Array.isArray(currentFilter.role) && currentFilter.role !== '') {
        const safeRole = safeAdminRoleFilter(currentFilter.role);
        if (safeRole) {
          query = query.eq('role', safeRole);
        }
      } else if (Array.isArray(currentFilter.role) && currentFilter.role.length > 0) {
        const validRoles = currentFilter.role.filter(r => 
          ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(r)
        ) as ('superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin')[];
        if (validRoles.length > 0) {
          query = query.in('role', validRoles);
        }
      }
      
      // Fix status filter enum comparison
      if (currentFilter.status && !Array.isArray(currentFilter.status) && currentFilter.status !== '') {
        const safeStatus = safeUserStatusFilter(currentFilter.status);
        if (safeStatus) {
          query = query.eq('profiles.status', safeStatus);
        }
      } else if (Array.isArray(currentFilter.status) && currentFilter.status.length > 0) {
        const validStatuses = currentFilter.status.filter(s => ['active', 'inactive'].includes(s));
        if (validStatuses.length > 0) {
          query = query.in('profiles.status', validStatuses);
        }
      }
      
      if (currentFilter.region_id) {
        query = query.eq('region_id', currentFilter.region_id);
      }
      
      if (currentFilter.sector_id) {
        query = query.eq('sector_id', currentFilter.sector_id);
      }
      
      if (currentFilter.school_id) {
        query = query.eq('school_id', currentFilter.school_id);
      }
      
      if (currentFilter.search) {
        query = query.or(`or(profiles.email.ilike.%${currentFilter.search}%,profiles.full_name.ilike.%${currentFilter.search}%)`);
      }
      
      // Pagination
      const page = currentFilter.page || 1;
      const limit = currentFilter.limit || 10;
      const from = (page - 1) * limit;
      const to = page * limit - 1;
      
      query = query.range(from, to);
      query = query.order('created_at', { ascending: false });
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Supabase sorğu xətası:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('Sorğudan məlumat qayıtmadı');
        setUsers([]);
        setTotalRecords(0);
        setTotalPages(1);
        setCurrentPage(1);
        setLoading(false);
        return;
      }
      
      console.log(`${data.length} istifadəçi məlumatı alındı`);
      
      // Process data - type assertions ilə təhlükəsiz data çevrilməsi
      const processedUsers = data.map(item => {
        // Profil və əlaqəli məlumatlar üçün təhlükəsiz çevrilmə
        const profile = (item.profiles as any) || {};
        const regions = (item.regions as any) || {};
        const sectors = (item.sectors as any) || {};
        const schools = (item.schools as any) || {};
        
        return {
          id: item.user_id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          fullName: profile.full_name || '',
          name: profile.full_name || '',
          role: item.role as UserRole,
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
          region_name: regions.name || '',
          sector_name: sectors.name || '',
          school_name: schools.name || ''
        };
      });
      
      setUsers(processedUsers);
      setTotalRecords(count || 0);
      setTotalPages(Math.ceil((count || 0) / limit));
      setCurrentPage(page);
    } catch (err) {
      console.error('İstifadəçilər əldə edilərkən xəta:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilter = useCallback((newFilter: Partial<UserFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    fetchUsers(updatedFilter);
  }, [filter, fetchUsers]);

  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    updateFilter({ page });
  }, [totalPages, updateFilter]);

  useEffect(() => {
    fetchUsers(filter);
  }, [fetchUsers, filter]);

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
