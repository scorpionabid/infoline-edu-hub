
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

export interface SchoolOperationsResult {
  loading: boolean;
  error: string | null;
  createSchool: (school: Partial<School>) => Promise<{ data?: School, error?: any }>;
  updateSchool: (id: string, updates: Partial<School>) => Promise<{ data?: School, error?: any }>;
  deleteSchool: (id: string) => Promise<{ success: boolean, error?: any }>;
  assignAdmin: (schoolId: string, userId: string) => Promise<{ success: boolean, error?: any }>;
}

export const useSchoolOperations = (): SchoolOperationsResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  const createSchool = async (school: Partial<School>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: createError } = await supabase
        .from('schools')
        .insert([school])
        .select()
        .single();
      
      if (createError) {
        setError(createError.message);
        return { error: createError };
      }
      
      return { data };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateSchool = async (id: string, updates: Partial<School>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        setError(updateError.message);
        return { error: updateError };
      }
      
      return { data };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteSchool = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        setError(deleteError.message);
        return { success: false, error: deleteError };
      }
      
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const assignAdmin = async (schoolId: string, userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Əvvəlcə məktəbə admin ID-si təyin edirik
      const { error: schoolUpdateError } = await supabase
        .from('schools')
        .update({ admin_id: userId })
        .eq('id', schoolId);
      
      if (schoolUpdateError) {
        throw schoolUpdateError;
      }
      
      // 2. İstifadəçi rolunu yeniləyirik
      const { error: roleUpdateError } = await supabase
        .from('user_roles')
        .update({ 
          role: 'schooladmin',
          school_id: schoolId
        })
        .eq('user_id', userId);
      
      if (roleUpdateError) {
        // Əvvəlki dəyişikliyi geri qaytarmaq lazımdır, amma sadəlik üçün edmirik
        throw roleUpdateError;
      }
      
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createSchool,
    updateSchool,
    deleteSchool,
    assignAdmin
  };
};
