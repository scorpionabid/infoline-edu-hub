
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/supabase';

type SchoolWithNames = School & {
  region_name?: string;
  sector_name?: string;
};

export const useSchools = (sectorId?: string) => {
  const [schools, setSchools] = useState<SchoolWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchSchools = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('schools')
        .select(`
          *,
          regions:region_id (name),
          sectors:sector_id (name)
        `)
        .order('name');
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Process the nested data to a flat structure
      const processedData = data?.map(item => ({
        ...item,
        region_name: item.regions?.name,
        sector_name: item.sectors?.name
      }));
      
      setSchools(processedData as SchoolWithNames[]);
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
      
      await fetchSchools(); // Refresh all schools to get the joined data
      
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
      
      await fetchSchools(); // Refresh all schools to get the joined data
      
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
  }, [sectorId]);

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
