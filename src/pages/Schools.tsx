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
  // Initialize pagination with default values
  const { 
    currentPage, 
    pageSize, 
    totalPages,
    setCurrentPage,
    setPageSize: updatePageSize,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  } = usePagination({
    totalItems: 0, // Will be updated after first fetch
    initialPage: 1,
    initialPageSize: 10
  });
  
  const [totalCount, setTotalCount] = useState(0);

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
      // Update total count if it has changed
      if (count !== totalCount) {
        setTotalCount(count || 0);
      }
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
      const { error } = await supabase
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
        });

      if (error) throw error;

      await fetchSchools();
      toast.success(t('schoolCreated'));
    } catch (err) {
      console.error('Error creating school:', err);
      toast.error(t('schoolCreationFailed'));
      throw err;
    }
  }, [fetchSchools, t]);

  const updateSchool = useCallback(async (schoolData: School) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: schoolData.name,
          region_id: schoolData.region_id,
          sector_id: schoolData.sector_id,
          principal_name: schoolData.principal_name || null,
          address: schoolData.address || null,
          phone: schoolData.phone || null,
          email: schoolData.email || null,
          student_count: schoolData.student_count || 0,
          teacher_count: schoolData.teacher_count || 0,
          status: schoolData.status,
          type: schoolData.type,
          language: schoolData.language
        })
        .eq('id', schoolData.id);

      if (error) throw error;

      await fetchSchools();
      toast.success(t('schoolUpdated'));
    } catch (err) {
      console.error('Error updating school:', err);
      toast.error(t('schoolUpdateFailed'));
      throw err;
    }
  }, [fetchSchools, t]);

  const deleteSchool = useCallback(async (school: School) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', school.id);

      if (error) throw error;

      await fetchSchools();
      toast.success(t('schoolDeleted'));
    } catch (err) {
      console.error('Error deleting school:', err);
      toast.error(t('schoolDeletionFailed'));
      throw err;
    }
  }, [fetchSchools, t]);

  const fetchRegions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Transform data to ensure proper typing
      const transformedRegions: Region[] = (data || []).map(region => ({
        ...region,
        status: region.status === 'active' ? 'active' : 'inactive'
      }));
      
      setRegions(transformedRegions);
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
      
      // Transform data to ensure proper typing
      const transformedSectors: Sector[] = (data || []).map(sector => ({
        ...sector,
        status: sector.status === 'active' ? 'active' : 'inactive',
        completion_rate: sector.completion_rate || 0,
        region_id: sector.region_id || ''
      }));
      
      setSectors(transformedSectors);
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
      
      // Transform data to match FullUserData interface
      const transformedUsers: FullUserData[] = (data || []).map((user: any) => ({
        id: user.id,
        email: user.email || '',
        full_name: user.full_name || '',
        fullName: user.full_name || '',
        name: user.full_name || '',
        role: 'user', // Default role
        phone: user.phone || '',
        position: user.position || '',
        language: user.language || 'az',
        avatar: user.avatar || '',
        avatar_url: user.avatar || '',
        status: user.status || 'active',
        last_login: user.last_login,
        last_sign_in_at: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
        preferences: {},
        notificationSettings: {
          email: true,
          push: false,
          sms: false,
          inApp: true,
          system: true,
          deadline: true,
          deadlineReminders: true,
          statusUpdates: true,
          weeklyReports: false
        },
        notification_settings: {
          email: true,
          push: false,
          sms: false,
          inApp: true,
          system: true,
          deadline: true,
          deadlineReminders: true,
          statusUpdates: true,
          weeklyReports: false
        }
      }));
      
      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users');
    }
  }, []);

  React.useEffect(() => {
    // Only fetch schools when pagination or filters change
    fetchSchools();
  }, [currentPage, pageSize, filters, fetchSchools]);
  
  // Initial data load
  React.useEffect(() => {
    fetchRegions();
    fetchSectors();
    fetchUsers();
  }, [fetchRegions, fetchSectors, fetchUsers]);

  // Create name maps for regions and sectors
  const regionNames = React.useMemo(() => {
    return regions.reduce<Record<string, string>>((acc, region) => {
      acc[region.id] = region.name;
      return acc;
    }, {});
  }, [regions]);

  const sectorNames = React.useMemo(() => {
    return sectors.reduce<Record<string, string>>((acc, sector) => {
      acc[sector.id] = sector.name;
      return acc;
    }, {});
  }, [sectors]);

  const handleAssignAdmin = useCallback(async (schoolId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ admin_id: userId })
        .eq('id', schoolId);

      if (error) throw error;
      
      await fetchSchools();
      toast.success(t('adminAssigned'));
    } catch (err) {
      console.error('Error assigning admin:', err);
      toast.error(t('adminAssignmentFailed'));
      throw err;
    }
  }, [fetchSchools, t]);

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
          isLoading={loading}
          onRefresh={fetchSchools}
          onCreate={createSchool}
          onEdit={updateSchool}
          onDelete={deleteSchool}
          onAssignAdmin={handleAssignAdmin}
          regionNames={regionNames}
          sectorNames={sectorNames}
        />
      </div>
    </>
  );
};

export default Schools;
