import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/ui';
import { convertToSchool, prepareSchoolForApi } from './schoolTypeConverters';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

export const useSchoolOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const createSchool = async (schoolData: Partial<School>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();

      if (error) throw error;

      toast.success(t('schoolCreated'));
      return convertToSchool(data);
    } catch (err: any) {
      console.error('Error creating school:', err);
      setError(err.message);
      toast.error(t('errorCreatingSchool'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSchool = async (id: string, schoolData: Partial<School>) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure data has required fields for Supabase
      const updatedData = {
        ...schoolData,
        // Add name if missing (required field but could be optional in our Partial type)
        name: schoolData.name || '' // This ensures name is always present
      };

      // Prepare data for API
      const apiData = prepareSchoolForApi(updatedData);

      const { data, error } = await supabase
        .from('schools')
        .update(apiData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success(t('schoolUpdated'));
      return convertToSchool(data);
    } catch (err: any) {
      console.error('Error updating school:', err);
      setError(err.message);
      toast.error(t('errorUpdatingSchool'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchool = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(t('schoolDeleted'));
      return true;
    } catch (err: any) {
      console.error('Error deleting school:', err);
      setError(err.message);
      toast.error(t('errorDeletingSchool'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSchool,
    updateSchool,
    deleteSchool,
    loading,
    error
  };
};

export default useSchoolOperations;
