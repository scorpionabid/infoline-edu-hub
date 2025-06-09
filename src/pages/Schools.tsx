import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';
import { Region } from '@/types/region';
import { Sector } from '@/types/sector';
import { FullUserData } from '@/types/user';
import { useLanguageSafe } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { usePagination } from '@/hooks/common/usePagination';
import { toast } from 'sonner';
import SchoolsContainer from '@/components/schools/SchoolsContainer';

const Schools = () => {
  const { t } = useLanguageSafe();
  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userRole, regionId, sectorId } = usePermissions();
  const { 
    currentPage, 
    pageSize, 
    totalCount, 
    setTotalCount, 
    goToPage,
    setPageSize: updatePageSize 
  } = usePagination();

  const [filters, setFilters] = useState({
    search: '',
    regionId: regionId || '',
    sectorId: sectorId || '',
    status: ''
  });

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('schools')
        .select(`
          *,
          regions:region_id(name),
          sectors:sector_id(name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (userRole === 'regionadmin' && regionId) {
        query = query.eq('region_id', regionId);
      } else if (userRole === 'sectoradmin' && sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,principal_name.ilike.%${filters.search}%`);
      }
      if (filters.regionId) {
        query = query.eq('region_id', filters.regionId);
      }
      if (filters.sectorId) {
        query = query.eq('sector_id', filters.sectorId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply pagination
      const offset = (currentPage - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      // Transform the data to ensure proper typing
      const transformedSchools: School[] = (data || []).map((school: any) => ({
        ...school,
        status: school.status || 'active',
        type: school.type || 'public',
        language: school.language || 'az',
        student_count: school.student_count || 0,
        teacher_count: school.teacher_count || 0,
        completion_rate: school.completion_rate || 0
      }));

      setSchools(transformedSchools);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to fetch schools');
      toast.error('Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters, userRole, regionId, sectorId, setTotalCount]);

  const createSchool = useCallback(async (schoolData: Omit<School, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: schoolData.name,
          region_id: schoolData.region_id,
          sector_id: schoolData.sector_id,
          principal_name: schoolData.principal_name || null,
          address: schoolData.address || null,
          phone: schoolData.phone || null,
          email: schoolData.email || null,
          student_count: schoolData.student_count || 0,
          teacher_count: schoolData.teacher_count || 0,
          status: schoolData.status || 'active',
          type: schoolData.type || 'public',
          language: schoolData.language || 'az'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSchools();
      toast.success('School created successfully');
      return data;
    } catch (err) {
      console.error('Error creating school:', err);
      toast.error('Failed to create school');
      throw err;
    }
  }, [fetchSchools]);

  const updateSchool = useCallback(async (id: string, schoolData: Partial<School>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update({
          name: schoolData.name,
          region_id: schoolData.region_id,
          sector_id: schoolData.sector_id,
          principal_name: schoolData.principal_name || null,
          address: schoolData.address || null,
          phone: schoolData.phone || null,
          email: schoolData.email || null,
          student_count: schoolData.student_count || null,
          teacher_count: schoolData.teacher_count || null,
          status: schoolData.status,
          type: schoolData.type,
          language: schoolData.language
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchSchools();
      toast.success('School updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating school:', err);
      toast.error('Failed to update school');
      throw err;
    }
  }, [fetchSchools]);

  const deleteSchool = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSchools();
      toast.success('School deleted successfully');
    } catch (err) {
      console.error('Error deleting school:', err);
      toast.error('Failed to delete school');
      throw err;
    }
  }, [fetchSchools]);

  const fetchRegions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setRegions(data);
    } catch (err) {
      console.error('Error fetching regions:', err);
      toast.error('Failed to fetch regions');
    }
  }, []);

  const fetchSectors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSectors(data);
    } catch (err) {
      console.error('Error fetching sectors:', err);
      toast.error('Failed to fetch sectors');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users');
    }
  }, []);

  React.useEffect(() => {
    Promise.all([fetchSchools(), fetchRegions(), fetchSectors(), fetchUsers()]);
  }, [fetchSchools, fetchRegions, fetchSectors, fetchUsers]);

  return (
    <>
      <Helmet>
        <title>{t('schools')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <SchoolsContainer
          schools={schools}
          regions={regions}
          sectors={sectors}
          users={users}
          loading={loading}
          error={error}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          filters={filters}
          onFiltersChange={setFilters}
          onPageChange={goToPage}
          onPageSizeChange={updatePageSize}
          onCreateSchool={createSchool}
          onRefresh={fetchSchools}
        />
      </div>
    </>
  );
};

export default Schools;
