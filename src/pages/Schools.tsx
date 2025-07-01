import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';
import { Region } from '@/types/region';
import { Sector } from '@/types/sector';
import { useTranslation } from '@/contexts/TranslationContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useEnhancedPagination } from '@/hooks/common/useEnhancedPagination';
import { filterSchools, sortSchools } from '@/utils/schoolUtils';
import { useSchoolAdmins } from '@/hooks/schools/useSchoolAdmins';
import { toast } from 'sonner';
import SchoolsContainer from '@/components/schools/SchoolsContainer';
import { assignExistingUserAsSchoolAdmin } from '@/services/schoolAdminService';

const Schools = () => {
  const { t } = useTranslation();
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userRole, regionId, sectorId } = usePermissions();

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

  // School IDs for admin loading
  const schoolIds = React.useMemo(() => allSchools.map(school => school.id), [allSchools]);
  const { adminMap } = useSchoolAdmins(schoolIds);

  // Enhanced pagination with filtering and sorting
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    processedItems: paginatedSchools,
    goToPage,
    setPageSize,
    filters,
    setFilters,
    sortOptions,
    setSortOptions
  } = useEnhancedPagination(
    allSchools,
    10,
    filterSchools,
    (a, b, sortOpts) => sortSchools(a, b, sortOpts, regionNames, sectorNames, adminMap)
  );

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
        `);

      // Apply role-based filtering - backend səviyyəsində minimal filtrlər
      if (userRole === 'regionadmin' && regionId) {
        query = query.eq('region_id', regionId);
      } else if (userRole === 'sectoradmin' && sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      const { data, error } = await query;
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

      setAllSchools(transformedSchools);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to fetch schools');
      toast.error('Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  }, [userRole, regionId, sectorId]);

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

  const deleteSchool = useCallback(async (school: School, deleteType: 'soft' | 'hard' = 'soft') => {
    try {
      if (deleteType === 'soft') {
        // Soft delete - məktəbi deaktiv et
        const { error } = await supabase
          .from('schools')
          .update({ status: 'inactive' })
          .eq('id', school.id);

        if (error) throw error;
        toast.success('Məktəb uğurla deaktiv edildi');
      } else {
        // Hard delete - məktəbi tamamilə sil
        // Əvvəlcə əlaqəli məlumatları sil
        
        // 1. Məktəb adminlərinin rollarını sil
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('school_id', school.id);

        if (roleError) {
          console.error('Error deleting school admin roles:', roleError);
        }

        // 2. Məktəb data entries-ləri sil
        const { error: dataError } = await supabase
          .from('data_entries')
          .delete()
          .eq('school_id', school.id);

        if (dataError) {
          console.error('Error deleting school data entries:', dataError);
        }

        // 3. Məktəb fayllarını sil
        const { error: filesError } = await supabase
          .from('school_files')
          .delete()
          .eq('school_id', school.id);

        if (filesError) {
          console.error('Error deleting school files:', filesError);
        }

        // 4. Məktəb linklərini sil
        const { error: linksError } = await supabase
          .from('school_links')
          .delete()
          .eq('school_id', school.id);

        if (linksError) {
          console.error('Error deleting school links:', linksError);
        }

        // 5. Məktəbi özünü sil
        const { error: schoolError } = await supabase
          .from('schools')
          .delete()
          .eq('id', school.id);

        if (schoolError) throw schoolError;
        toast.success('Məktəb və bütün əlaqəli məlumatlar uğurla silindi');
      }

      await fetchSchools();
    } catch (err) {
      console.error('Error deleting school:', err);
      const errorMessage = deleteType === 'soft' 
        ? 'Məktəb deaktiv edilərkən xəta baş verdi'
        : 'Məktəb silinərkən xəta baş verdi';
      toast.error(errorMessage);
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

  const handleAssignAdmin = useCallback(async (schoolId: string, adminData: any) => {
    try {
      console.log('🎯 Schools.tsx - handleAssignAdmin called with:', { schoolId, adminData });
      
      const result = await assignExistingUserAsSchoolAdmin(adminData.userId, schoolId);
      
      if (result.success) {
        await fetchSchools();
        toast.success(t('adminAssigned') || 'Admin uğurla təyin edildi');
      } else {
        throw new Error(result.error || 'Admin təyin edilərkən xəta baş verdi');
      }
    } catch (err: any) {
      console.error('Error assigning admin:', err);
      toast.error(err.message || t('adminAssignmentFailed') || 'Admin təyin etmə uğursuz oldu');
      throw err;
    }
  }, [fetchSchools, t]);

  // Initial data load
  React.useEffect(() => {
    fetchSchools();
    fetchRegions();
    fetchSectors();
  }, [fetchSchools, fetchRegions, fetchSectors]);

  return (
    <>
      <Helmet>
        <title>{t('schools')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <SchoolsContainer
          schools={paginatedSchools}
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
          // Pagination props
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalItems}
          totalPages={totalPages}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
          // Filter props
          filters={filters}
          onFilterChange={setFilters}
          // Sort props
          sortOptions={sortOptions}
          onSortChange={setSortOptions}
        />
      </div>
    </>
  );
};

export default Schools;