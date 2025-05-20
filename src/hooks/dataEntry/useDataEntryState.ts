
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';

interface UseDataEntryStateProps {
  categoryId: string;
  schoolId: string;
}

export const useDataEntryState = ({ categoryId, schoolId }: UseDataEntryStateProps) => {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchDataEntries = useCallback(async () => {
    if (!categoryId || !schoolId) {
      setDataEntries([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);

      if (error) throw error;

      setDataEntries(data || []);
    } catch (err: any) {
      console.error('Error fetching data entries:', err);
      setError(err.message);
      toast.error(`Failed to fetch data entries: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId]);

  useEffect(() => {
    fetchDataEntries();
  }, [fetchDataEntries]);

  const saveDataEntries = async (entries: any[]): Promise<boolean> => {
    if (!categoryId || !schoolId) {
      toast.error('Missing category or school ID');
      return false;
    }

    setIsLoading(true);
    try {
      // Process entries to ensure they have proper category and school IDs
      const processedEntries = entries.map(entry => ({
        ...entry,
        category_id: categoryId,
        school_id: schoolId,
      }));

      // Upsert entries (insert or update)
      const { error } = await supabase
        .from('data_entries')
        .upsert(processedEntries, {
          onConflict: 'column_id,school_id,category_id',
          ignoreDuplicates: false,
        });

      if (error) throw error;

      await fetchDataEntries(); // Refresh data
      toast.success('Data saved successfully');
      return true;
    } catch (err: any) {
      console.error('Error saving data entries:', err);
      toast.error(`Failed to save data: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dataEntries,
    isLoading,
    error,
    saveDataEntries,
    fetchDataEntries
  };
};
