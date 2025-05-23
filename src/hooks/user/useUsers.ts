import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserFilter, UserRole } from '@/types/user';

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
      
      // Apply filters
      if (currentFilter.role && currentFilter.role.length) {
        if (Array.isArray(currentFilter.role)) {
          // role massivi için uyğun sorğu
          query = query.in('role', currentFilter.role as any);
        } else {
          // tek rol üçün uyğun sorğu
          query = query.eq('role', currentFilter.role as any);
        }
      }
      
      if (currentFilter.status && currentFilter.status.length && currentFilter.status !== "") {
        if (Array.isArray(currentFilter.status)) {
          query = query.in('profiles.status', currentFilter.status);
        } else {
          query = query.eq('profiles.status', currentFilter.status);
        }
      }
      
      if (currentFilter.regionId) {
        query = query.eq('region_id', currentFilter.regionId);
      }
      
      if (currentFilter.sectorId) {
        query = query.eq('sector_id', currentFilter.sectorId);
      }
      
      if (currentFilter.schoolId) {
        query = query.eq('school_id', currentFilter.schoolId);
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
