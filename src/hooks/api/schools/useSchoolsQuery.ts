
import { useState, useEffect } from 'react';
import { School } from '@/types/school';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

// Real Supabase integration for schools
export const useSchoolsQuery = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const user = useAuthStore(selectUser);

  // Fetch schools based on user role and permissions
  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('schools')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      // Filter by user role
      if (user?.role === 'sectoradmin' && user.sector_id) {
        console.log(`[useSchoolsQuery] Applying sector filter: sector_id = ${user.sector_id}`);
        query = query.eq('sector_id', user.sector_id);
      } else if (user?.role === 'regionadmin' && user.region_id) {
        console.log(`[useSchoolsQuery] Applying region filter: region_id = ${user.region_id}`);
        query = query.eq('region_id', user.region_id);
      } else {
        console.log('[useSchoolsQuery] No filter applied - showing all schools');
      }
      // SuperAdmin sees all schools - no filter needed
      
      console.log('[useSchoolsQuery] Executing query...');
      const { data, error: fetchError } = await query;
      console.log('[useSchoolsQuery] Query result:', { data, error: fetchError });
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // Transform and set schools data
      const schoolsData: School[] = (data || []).map(school => ({
        id: school.id,
        name: school.name || '',
        region_id: school.region_id || '',
        sector_id: school.sector_id || '',
        status: (school.status as 'active' | 'inactive') || 'active',
        created_at: school.created_at || new Date().toISOString(),
        updated_at: school.updated_at || new Date().toISOString(),
        // Additional fields from database
        principal_name: school.principal_name,
        address: school.address,
        phone: school.phone,
        email: school.email,
        student_count: school.student_count,
        teacher_count: school.teacher_count,
        type: school.type,
        language: school.language,
        completion_rate: school.completion_rate || 0,
        logo: school.logo,
        admin_email: school.admin_email,
        admin_id: school.admin_id
      }));
      
      setSchools(schoolsData);
      
      console.log(`[useSchoolsQuery] Loaded ${schoolsData.length} schools for user role: ${user?.role}`);
      console.log('[useSchoolsQuery] Debug Info:', {
        userRole: user?.role,
        userSectorId: user?.sector_id,
        userRegionId: user?.region_id,
        rawData: data,
        schoolsData: schoolsData,
        queryApplied: user?.role === 'sectoradmin' ? `sector_id = ${user.sector_id}` : 
                      user?.role === 'regionadmin' ? `region_id = ${user.region_id}` : 'no filter'
      });
      
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schools on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchSchools();
    }
  }, [user?.id, user?.role, user?.sector_id, user?.region_id]);

  const deleteSchool = async (schoolId: string) => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      
      setSchools(prevSchools => prevSchools.filter(school => school.id !== schoolId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting school:', error);
      setError(error as Error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const addSchool = async (schoolData: Partial<School>) => {
    setLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('schools')
        .insert({
          name: schoolData.name || '',
          region_id: schoolData.region_id || user?.region_id || '',
          sector_id: schoolData.sector_id || user?.sector_id || '',
          status: schoolData.status || 'active',
          principal_name: schoolData.principal_name,
          address: schoolData.address,
          phone: schoolData.phone,
          email: schoolData.email,
          student_count: schoolData.student_count,
          teacher_count: schoolData.teacher_count,
          type: schoolData.type,
          language: schoolData.language
        })
        .select()
        .single();
      
      if (insertError) {
        throw new Error(insertError.message);
      }
      
      const newSchool: School = {
        id: data.id,
        name: data.name || '',
        region_id: data.region_id || '',
        sector_id: data.sector_id || '',
        status: (data.status as 'active' | 'inactive') || 'active',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        ...schoolData
      };
      
      setSchools(prevSchools => [...prevSchools, newSchool]);
      return { success: true, data: [newSchool] };
    } catch (error) {
      console.error('Error adding school:', error);
      setError(error as Error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateSchool = async (schoolId: string, schoolData: Partial<School>) => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('schools')
        .update({
          name: schoolData.name,
          principal_name: schoolData.principal_name,
          address: schoolData.address,
          phone: schoolData.phone,
          email: schoolData.email,
          student_count: schoolData.student_count,
          teacher_count: schoolData.teacher_count,
          type: schoolData.type,
          language: schoolData.language,
          status: schoolData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', schoolId);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      setSchools(prevSchools => 
        prevSchools.map(school => 
          school.id === schoolId ? { ...school, ...schoolData } : school
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating school:', error);
      setError(error as Error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolsBySector = async (sectorId: string) => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('schools')
        .select('*')
        .eq('sector_id', sectorId)
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      const schoolsData: School[] = (data || []).map(school => ({
        id: school.id,
        name: school.name || '',
        region_id: school.region_id || '',
        sector_id: school.sector_id || '',
        status: (school.status as 'active' | 'inactive') || 'active',
        created_at: school.created_at || new Date().toISOString(),
        updated_at: school.updated_at || new Date().toISOString()
      }));
      
      setSchools(schoolsData);
      return { success: true, data: schoolsData };
    } catch (error) {
      setError(error as Error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    return await fetchSchools();
  };

  return {
    schools,
    loading,
    error,
    deleteSchool,
    addSchool,
    updateSchool,
    fetchSchools,
    fetchSchoolsBySector,
    refresh
  };
};
