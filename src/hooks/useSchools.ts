import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/supabase';

export const useSchools = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const addSchool = useCallback(async (newSchoolData: Omit<School, 'id' | 'created_at' | 'updated_at' | 'completion_rate'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([newSchoolData])
        .select()
        .single();

      if (error) throw error;
      
      toast.success(t('schoolAdded'), {
        description: t('schoolAddedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error adding school:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddSchool')
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const updateSchool = useCallback(async (id: string, updates: Partial<School>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success(t('schoolUpdated'), {
        description: t('schoolUpdatedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error updating school:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateSchool')
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const deleteSchool = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success(t('schoolDeleted'), {
        description: t('schoolDeletedDesc')
      });
    } catch (err: any) {
      console.error('Error deleting school:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteSchool')
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    loading,
    addSchool,
    updateSchool,
    deleteSchool
  };
};
