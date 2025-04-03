
import { useState, useCallback } from 'react';
import { School, adaptSchoolData } from '@/types/school';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSchoolsData = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          regions(name),
          sectors(name)
        `)
        .order('name');
        
      if (error) throw error;
      
      const adaptedSchools = data.map((school: any) => ({
        id: school.id,
        name: school.name,
        regionId: school.region_id,
        region_id: school.region_id,
        regionName: school.regions?.name || '',
        sectorId: school.sector_id,
        sector_id: school.sector_id,
        sectorName: school.sectors?.name || '',
        address: school.address,
        phone: school.phone,
        email: school.email,
        principalName: school.principal_name,
        principal_name: school.principal_name,
        studentCount: school.student_count,
        student_count: school.student_count,
        teacherCount: school.teacher_count,
        teacher_count: school.teacher_count,
        type: school.type,
        language: school.language,
        status: school.status,
        adminEmail: school.admin_email,
        admin_email: school.admin_email,
        createdAt: school.created_at,
        created_at: school.created_at,
        updatedAt: school.updated_at,
        updated_at: school.updated_at,
        logo: school.logo,
        completionRate: school.completion_rate,
        completion_rate: school.completion_rate
      }));
      
      setSchools(adaptedSchools);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchool = useCallback(async (schoolData: Omit<School, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: schoolData.name,
          region_id: schoolData.regionId || schoolData.region_id,
          sector_id: schoolData.sectorId || schoolData.sector_id,
          address: schoolData.address,
          phone: schoolData.phone,
          email: schoolData.email,
          principal_name: schoolData.principalName || schoolData.principal_name,
          student_count: schoolData.studentCount || schoolData.student_count,
          teacher_count: schoolData.teacherCount || schoolData.teacher_count,
          type: schoolData.type,
          language: schoolData.language,
          status: schoolData.status || 'active',
          admin_email: schoolData.adminEmail || schoolData.admin_email,
          completion_rate: schoolData.completionRate || schoolData.completion_rate
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setSchools(prevSchools => [...prevSchools, adaptSchoolData(data)]);
      return true;
    } catch (err) {
      console.error('Error creating school:', err);
      return false;
    }
  }, []);

  const updateSchool = useCallback(async (schoolId: string, schoolData: Partial<School>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update({
          name: schoolData.name,
          region_id: schoolData.regionId || schoolData.region_id,
          sector_id: schoolData.sectorId || schoolData.sector_id,
          address: schoolData.address,
          phone: schoolData.phone,
          email: schoolData.email,
          principal_name: schoolData.principalName || schoolData.principal_name,
          student_count: schoolData.studentCount || schoolData.student_count,
          teacher_count: schoolData.teacherCount || schoolData.teacher_count,
          type: schoolData.type,
          language: schoolData.language,
          status: schoolData.status,
          admin_email: schoolData.adminEmail || schoolData.admin_email,
          completion_rate: schoolData.completionRate || schoolData.completion_rate
        })
        .eq('id', schoolId)
        .select()
        .single();
        
      if (error) throw error;
      
      setSchools(prevSchools => 
        prevSchools.map(school => 
          school.id === schoolId ? adaptSchoolData(data) : school
        )
      );
      return true;
    } catch (err) {
      console.error('Error updating school:', err);
      return false;
    }
  }, []);

  const deleteSchool = useCallback(async (schoolId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
        
      if (error) throw error;
      
      setSchools(prevSchools => prevSchools.filter(school => school.id !== schoolId));
      return true;
    } catch (err) {
      console.error('Error deleting school:', err);
      return false;
    }
  }, []);

  // Məktəb admin əməliyyatları üçün əlavə funksiyalar
  const assignAdmin = useCallback(async (schoolId: string, adminEmail: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ admin_email: adminEmail })
        .eq('id', schoolId);
        
      if (error) throw error;
      
      // Məktəb siyahısını yeniləmək
      await fetchSchools();
      return true;
    } catch (err) {
      console.error('Error assigning admin:', err);
      return false;
    }
  }, [fetchSchools]);

  const unassignAdmin = useCallback(async (schoolId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ admin_email: null })
        .eq('id', schoolId);
        
      if (error) throw error;
      
      // Məktəb siyahısını yeniləmək
      await fetchSchools();
      return true;
    } catch (err) {
      console.error('Error unassigning admin:', err);
      return false;
    }
  }, [fetchSchools]);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent');
      return true;
    } catch (err) {
      console.error('Error resetting password:', err);
      return false;
    }
  }, []);

  return {
    schools,
    loading,
    error,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool,
    assignAdmin,
    unassignAdmin,
    resetPassword
  };
};

export default useSchoolsData;
