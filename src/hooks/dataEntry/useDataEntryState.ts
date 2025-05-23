
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
    // Early return if IDs are missing
    if (!categoryId || !schoolId) {
      console.log('Missing required IDs for data entry fetch:', { categoryId, schoolId });
      setDataEntries([]);
      setError('Missing category or school ID');
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

      // Ensure we handle the data safely, even if it's null
      setDataEntries(Array.isArray(data) ? data : []);
      
      // Log the result for debugging
      console.log(`Fetched ${Array.isArray(data) ? data.length : 0} data entries for category ${categoryId} and school ${schoolId}`);
    } catch (err: any) {
      console.error('Error fetching data entries:', err);
      setError(err.message || 'Failed to fetch data entries');
      toast.error(`Failed to fetch data entries: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId]);

  // Fetch data when IDs change
  useEffect(() => {
    fetchDataEntries();
  }, [fetchDataEntries]);

  const saveDataEntries = async (entries: any[]): Promise<boolean> => {
    // Early return if IDs are missing
    if (!categoryId || !schoolId) {
      toast.error('Missing category or school ID');
      return false;
    }

    // Early return if entries is not an array
    if (!Array.isArray(entries)) {
      console.error('Entries is not an array:', entries);
      toast.error('Invalid entries data format');
      return false;
    }

    setIsLoading(true);
    try {
      // Filter out entries that don't have valid column_id
      const validEntries = entries.filter(entry => entry && entry.column_id);
      
      if (validEntries.length === 0) {
        console.warn('No valid entries to save');
        toast.warning('No data to save');
        return false;
      }
      
      // Process entries to ensure they have proper category and school IDs
      const processedEntries = validEntries.map(entry => ({
        ...entry,
        category_id: categoryId,
        school_id: schoolId,
      }));

      // Log the entries we're about to save
      console.log('Saving data entries:', processedEntries);

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
      toast.error(`Failed to save data: ${err.message || 'Unknown error'}`);
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

export default useDataEntryState;
