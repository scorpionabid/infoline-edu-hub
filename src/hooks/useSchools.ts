
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  
  const addSchool = async (newSchoolData: Omit<School, "id" | "created_at" | "updated_at" | "completion_rate">) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schools')
        .insert([newSchoolData])
        .select();
        
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Məktəbi əlavə edərkən xəta:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  const updateSchool = async (id: string, updates: Partial<School>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Məktəbi yeniləyərkən xəta:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  const deleteSchool = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Məktəbi silməkdə xəta:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Sektorun ID-sinə görə məktəbləri yükləmə
  const fetchSchoolsBySector = async (sectorId: string) => {
    if (!sectorId) {
      setSchools([]);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('sector_id', sectorId)
        .order('name', { ascending: true });
        
      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Sektora görə məktəbləri yükləyərkən xəta:', error);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    schools,
    loading,
    addSchool,
    updateSchool,
    deleteSchool,
    fetchSchoolsBySector
  };
};
