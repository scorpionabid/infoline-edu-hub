import { useState, useEffect } from 'react';
import { School } from '@/types/school';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

// Real Supabase integration for schools with enhanced sector filtering
export const useSchoolsQuery = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const user = useAuthStore(selectUser);

  // Calculate completion rate for a school based on real data_entries
  const calculateSchoolCompletion = async (schoolId: string): Promise<number> => {
    try {
      const { data: entries, error } = await supabase
        .from('data_entries')
        .select('id, status, column_id')
        .eq('school_id', schoolId);

      if (error) throw error;

      if (!entries || entries.length === 0) return 0;

      const approvedEntries = entries.filter(entry => entry.status === 'approved');
      return Math.round((approvedEntries.length / entries.length) * 100);
    } catch (error) {
      console.error('Error calculating completion for school:', schoolId, error);
      return 0;
    }
  };

  // Fetch schools based on user role and permissions with completion rates
  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('schools')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      // Apply role-based filtering
      if (user?.role === 'sectoradmin' && user.sector_id) {
        console.log(`[useSchoolsQuery] Applying sector filter: sector_id = ${user.sector_id}`);
        query = query.eq('sector_id', user.sector_id);
      } else if (user?.role === 'regionadmin' && user.region_id) {
        console.log(`[useSchoolsQuery] Applying region filter: region_id = ${user.region_id}`);
        query = query.eq('region_id', user.region_id);
      } else {
        console.log('[useSchoolsQuery] No filter applied - showing all schools');
      }
      
      console.log('[useSchoolsQuery] Executing query...');
      const { data, error: fetchError } = await query;
      console.log('[useSchoolsQuery] Query result:', { data, error: fetchError });
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // Transform schools data and calculate completion rates
      const schoolsData: School[] = await Promise.all(
        (data || []).map(async (school) => {
          const completion_rate = await calculateSchoolCompletion(school.id);
          
          return {
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
            completion_rate,
            logo: school.logo,
            admin_email: school.admin_email,
            admin_id: school.admin_id
          };
        })
      );
      
      setSchools(schoolsData);
      
      console.log(`[useSchoolsQuery] Loaded ${schoolsData.length} schools for user role: ${user?.role}`);
      console.log('[useSchoolsQuery] Schools with completion rates:', {
        userRole: user?.role,
        userSectorId: user?.sector_id,
        userRegionId: user?.region_id,
        schoolsCount: schoolsData.length,
        avgCompletion: schoolsData.reduce((sum, s) => sum + s.completion_rate, 0) / schoolsData.length
      });
      
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err);
      setSchools([]);
      toast.error('Məktəblər yüklənilərkən xəta baş verdi', {
        description: err.message
      });
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
        completion_rate: 0,
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
      
      const schoolsData: School[] = await Promise.all(
        (data || []).map(async (school) => {
          const completion_rate = await calculateSchoolCompletion(school.id);
          
          return {
            id: school.id,
            name: school.name || '',
            region_id: school.region_id || '',
            sector_id: school.sector_id || '',
            status: (school.status as 'active' | 'inactive') || 'active',
            created_at: school.created_at || new Date().toISOString(),
            updated_at: school.updated_at || new Date().toISOString(),
            completion_rate
          };
        })
      );
      
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
