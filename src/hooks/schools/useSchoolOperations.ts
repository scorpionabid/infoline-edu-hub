
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/ui';
import { mapApiDataToSchool } from './schoolTypeConverters';

export const useSchoolOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSchool = async (schoolData: Pick<School, 'name'> & Partial<Omit<School, 'id' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure name is not undefined
      if (!schoolData.name) {
        throw new Error('School name is required');
      }
      
      const { data, error: apiError } = await supabase
        .from('schools')
        .insert({ 
          ...schoolData,
          status: schoolData.status || 'active'
        })
        .select()
        .single();
        
      if (apiError) throw new Error(apiError.message);
      
      if (!data) {
        throw new Error('Failed to create school');
      }
      
      return mapApiDataToSchool(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create school');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const updateSchool = async (id: string, schoolData: Partial<School> & { name: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Ensure name is not undefined
      if (!schoolData.name) {
        throw new Error('School name is required');
      }
      
      const { data, error: apiError } = await supabase
        .from('schools')
        .update({
          ...schoolData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (apiError) throw new Error(apiError.message);
      
      if (!data) {
        throw new Error('Failed to update school');
      }
      
      return mapApiDataToSchool(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update school');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchool = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: apiError } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
        
      if (apiError) throw new Error(apiError.message);
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete school');
      setError(error);
      throw error;
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
