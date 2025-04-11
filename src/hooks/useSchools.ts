import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School, adaptSchoolFromSupabase } from '@/types/supabase';
import { adaptSchoolToSupabase } from '@/types/supabase';

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Məktəbləri əldə et
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('schools').select('*');
      
      if (error) throw error;
      
      // Verilənləri uyğun School strukturuna çevir
      const convertedSchools = data.map((item: any) => adaptSchoolFromSupabase(item));
      setSchools(convertedSchools);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Məktəb əlavə et
  const addSchool = async (newSchool: Omit<School, 'id' | 'completion_rate' | 'created_at' | 'updated_at'>) => {
    try {
      const schoolData = adaptSchoolToSupabase(newSchool);
      const { data, error } = await supabase.from('schools').insert([schoolData]).select();
      
      if (error) throw error;
      
      // Məktəblər siyahısını yenilə
      fetchSchools();
      
      // Uyğun tipə çevirmədən əvvəl objekt tipinin düzəldilməsi
      return data?.[0] ? adaptSchoolFromSupabase(data[0]) : null;
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  };

  // Məktəbi yenilə
  const updateSchool = async (id: string, updatedSchool: Partial<School>) => {
    try {
      const schoolData = adaptSchoolToSupabase(updatedSchool);
      const { error } = await supabase.from('schools').update(schoolData).eq('id', id);
      
      if (error) throw error;
      
      // Məktəblər siyahısını yenilə
      fetchSchools();
      
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  // Məktəbi sil
  const deleteSchool = async (id: string) => {
    try {
      const { error } = await supabase.from('schools').delete().eq('id', id);
      
      if (error) throw error;
      
      // Məktəblər siyahısını yenilə
      fetchSchools();
      
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  // Component mount olduqda məktəbləri əldə et
  useEffect(() => {
    fetchSchools();
  }, []);

  return {
    schools,
    loading,
    error,
    fetchSchools,
    addSchool,
    updateSchool,
    deleteSchool
  };
};
