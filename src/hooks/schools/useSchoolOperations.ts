
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { School } from '@/types/ui';

export const useSchoolOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSchool = async (schoolData: Partial<School> & { name: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      toast.success('School created successfully');
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error creating school:', error);
      setError(error);
      toast.error(`Error creating school: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSchool = async (id: string, schoolData: Partial<School> & { name: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Ensure name is always present
      if (!schoolData.name) {
        throw new Error('School name is required');
      }

      const { data, error } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      toast.success('School updated successfully');
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating school:', error);
      setError(error);
      toast.error(`Error updating school: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSchool = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      toast.success('School deleted successfully');
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting school:', error);
      setError(error);
      toast.error(`Error deleting school: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSchool,
    updateSchool,
    deleteSchool,
    isLoading,
    error,
  };
};
