
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/supabase';

export const useSchools = (regionId?: string, sectorId?: string) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchSchools = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setSchools(data as School[]);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadSchools')
      });
    } finally {
      setLoading(false);
    }
  };

  const addSchool = async (school: Omit<School, 'id' | 'created_at' | 'updated_at' | 'completion_rate'>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([school])
        .select()
        .single();

      if (error) throw error;
      
      setSchools(prev => [...prev, data as School]);
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
    }
  };

  const updateSchool = async (id: string, updates: Partial<School>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSchools(prev => prev.map(school => 
        school.id === id ? { ...school, ...data } as School : school
      ));
      
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
    }
  };

  const deleteSchool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSchools(prev => prev.filter(school => school.id !== id));
      
      toast.success(t('schoolDeleted'), {
        description: t('schoolDeletedDesc')
      });
    } catch (err: any) {
      console.error('Error deleting school:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteSchool')
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [regionId, sectorId]);

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
