
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*');

      if (error) {
        throw error;
      }

      setSchools(data || []);
    } catch (error: any) {
      setError(error);
      console.error('Məktəbləri əldə edərkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const addSchool = async (schoolData: Omit<School, 'id' | 'created_at' | 'updated_at' | 'completion_rate'>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchSchools();
      return data;
    } catch (error) {
      console.error('Məktəbi əlavə edərkən xəta:', error);
      throw error;
    }
  };

  const addSchools = async (schoolsData: Omit<School, 'id' | 'created_at' | 'updated_at' | 'completion_rate'>[]) => {
    try {
      // Burada School tipinin tələblərinə uyğun obyektlər yaradırıq
      const formattedSchools = schoolsData.map(school => ({
        name: school.name,
        region_id: school.region_id,
        sector_id: school.sector_id,
        address: school.address,
        phone: school.phone,
        email: school.email,
        principal_name: school.principal_name,
        status: school.status || 'active',
        type: school.type,
        language: school.language,
        student_count: school.student_count,
        teacher_count: school.teacher_count,
        admin_email: school.admin_email,
        logo: school.logo
      }));

      const { data, error } = await supabase
        .from('schools')
        .insert(formattedSchools);

      if (error) {
        throw error;
      }

      await fetchSchools();
      return true;
    } catch (error) {
      console.error('Məktəbləri əlavə edərkən xəta:', error);
      return false;
    }
  };

  const updateSchool = async (id: string, updates: Partial<School>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchSchools();
      return true;
    } catch (error) {
      console.error('Məktəbi yeniləyərkən xəta:', error);
      return false;
    }
  };

  const deleteSchool = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchSchools();
      return true;
    } catch (error) {
      console.error('Məktəbi silərkən xəta:', error);
      return false;
    }
  };

  return {
    schools,
    loading,
    error,
    fetchSchools,
    addSchool,
    addSchools,
    updateSchool,
    deleteSchool,
  };
};

// Əsas export üçün həm default export, həm də named export əlavə edirik
export default useSchools;
