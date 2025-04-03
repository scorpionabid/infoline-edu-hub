
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useSchoolsData = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('schools').select('*');

      // Rol əsaslı filtrasiya
      switch (user?.role) {
        case 'superadmin':
          // SuperAdmin bütün məktəbləri görə bilər
          break;
        case 'regionadmin':
          query = query.eq('region_id', user.regionId);
          break;
        case 'sectoradmin':
          query = query.eq('sector_id', user.sectorId);
          break;
        case 'schooladmin':
          query = query.eq('id', user.schoolId);
          break;
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      setSchools(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Məktəbləri yükləyərkən xəta:', err);
      setError(err);
      setLoading(false);
      toast.error('Məktəbləri yükləyərkən xəta baş verdi');
    }
  }, [user]);

  const createSchool = useCallback(async (schoolData: Omit<School, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert(schoolData)
        .select()
        .single();

      if (error) throw error;

      setSchools(prev => [...prev, data]);
      toast.success('Məktəb uğurla yaradıldı');
      return data;
    } catch (err: any) {
      console.error('Məktəb yaradılarkən xəta:', err);
      toast.error('Məktəb yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  const updateSchool = useCallback(async (schoolId: string, schoolData: Partial<School>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', schoolId)
        .select()
        .single();

      if (error) throw error;

      setSchools(prev => prev.map(school => 
        school.id === schoolId ? data : school
      ));
      
      toast.success('Məktəb uğurla yeniləndi');
      return data;
    } catch (err: any) {
      console.error('Məktəb yenilənərkən xəta:', err);
      toast.error('Məktəb yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const deleteSchool = useCallback(async (schoolId: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);

      if (error) throw error;

      setSchools(prev => prev.filter(school => school.id !== schoolId));
      toast.success('Məktəb uğurla silindi');
      return true;
    } catch (err: any) {
      console.error('Məktəb silinərkən xəta:', err);
      toast.error('Məktəb silinərkən xəta baş verdi');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return {
    schools,
    loading,
    error,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool
  };
};
