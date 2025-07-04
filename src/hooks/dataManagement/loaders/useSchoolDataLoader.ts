
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SchoolDataEntry } from '../types';

export const useSchoolDataLoader = () => {
  const [loading, setLoading] = useState(false);

  const loadSchoolData = async (categoryId: string, columnId: string): Promise<SchoolDataEntry[]> => {
    try {
      setLoading(true);
      console.log('Loading school data for:', { categoryId, columnId });

      const { data, error } = await supabase
        .from('data_entries')
        .select(`
          *,
          schools!data_entries_school_id_fkey (
            id,
            name
          )
        `)
        .eq('category_id', categoryId)
        .eq('column_id', columnId);

      if (error) {
        console.error('Error loading school data:', error);
        throw error;
      }

      if (!data) {
        return [];
      }

      // Transform data for UI
      const transformedData: SchoolDataEntry[] = data.map(entry => ({
        id: entry.id,
        school_id: entry.school_id,
        school_name: entry.schools?.name || 'Naməlum məktəb',
        category_id: entry.category_id,
        column_id: entry.column_id,
        value: entry.value || '',
        status: entry.status || 'empty',
        created_at: entry.created_at,
        updated_at: entry.updated_at
      }));

      console.log('Transformed school data:', transformedData);
      return transformedData;

    } catch (error) {
      console.error('Failed to load school data:', error);
      throw new Error('Məktəb məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return {
    loadSchoolData,
    loading
  };
};
