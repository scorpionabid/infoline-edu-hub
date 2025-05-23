
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
    // Safety check for required IDs
    if (!categoryId || !schoolId) {
      console.log('Missing required IDs for data entry fetch:', { categoryId, schoolId });
      setDataEntries([]);
      setError('Missing category or school ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching data entries for category ${categoryId} and school ${schoolId}`);
      
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .is('deleted_at', null);

      if (error) {
        console.error('Supabase error fetching data entries:', error);
        throw error;
      }

      // Defensive handling for data
      if (!data) {
        console.log('No data received from data_entries query');
        setDataEntries([]);
        return;
      }
      
      if (!Array.isArray(data)) {
        console.error('Expected array from data_entries query but got:', typeof data);
        setDataEntries([]);
        return;
      }

      // Filter out any potentially invalid entries and clean the data
      const safeEntries = data
        .filter(entry => {
          if (!entry) {
            console.warn('Null or undefined entry found in data_entries result');
            return false;
          }
          if (!entry.column_id) {
            console.warn('Entry without column_id found:', entry);
            return false;
          }
          return true;
        })
        .map(entry => ({
          ...entry,
          value: entry.value !== undefined && entry.value !== null ? entry.value : '', // Ensure value is never null/undefined
          status: entry.status || 'draft' // Ensure status is never null/undefined
        }));
      
      // Create a lookup object to prevent "Cannot read properties of undefined" errors
      // This is crucial for handling UUIDs like '3d5f36f0-f689-40d6-a0e5-0d6420623551'
      const entriesLookup: Record<string, DataEntry> = {};
      safeEntries.forEach(entry => {
        if (entry && entry.column_id) {
          entriesLookup[entry.column_id] = entry;
        }
      });
      
      setDataEntries(safeEntries);
      
      // Log the result for debugging
      console.log(`Successfully fetched ${safeEntries.length} data entries for category ${categoryId} and school ${schoolId}`);
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
    if (categoryId && schoolId) {
      fetchDataEntries();
    } else {
      setDataEntries([]);
      setError(categoryId ? 'Missing school ID' : 'Missing category ID');
    }
  }, [fetchDataEntries, categoryId, schoolId]);

  const saveDataEntries = async (entries: any[]): Promise<boolean> => {
    // Early return if IDs are missing
    if (!categoryId || !schoolId) {
      console.error('Missing required IDs for saving entries:', { categoryId, schoolId });
      toast.error('Missing category or school ID');
      return false;
    }

    // Early return if entries is not an array
    if (!Array.isArray(entries)) {
      console.error('Entries is not an array:', entries);
      toast.error('Invalid entries data format');
      return false;
    }

    console.log('About to save data entries:', { 
      categoryId, 
      schoolId, 
      entriesCount: entries.length
    });
    
    setIsLoading(true);
    try {
      // Filter out entries that don't have valid column_id
      const validEntries = entries.filter(entry => {
        if (!entry) {
          console.warn('Null or undefined entry found in entries to save');
          return false;
        }
        if (!entry.column_id) {
          console.warn('Entry without column_id found:', entry);
          return false;
        }
        return true;
      });
      
      if (validEntries.length === 0) {
        console.warn('No valid entries to save');
        toast.warning('No data to save');
        return false;
      }
      
      // Process entries to ensure they have proper category and school IDs
      const processedEntries = validEntries.map(entry => {
        // Create a clean entry with required fields and ensuring no undefined values
        const cleanEntry = { 
          column_id: entry.column_id,
          category_id: categoryId,
          school_id: schoolId,
          value: entry.value ?? '',  // Ensure value is never null or undefined
          updated_at: new Date().toISOString()
        };
        
        // Add id if present
        if (entry.id) {
          cleanEntry['id'] = entry.id;
        }
        
        // Add status if present
        if (entry.status) {
          cleanEntry['status'] = entry.status;
        }
        
        return cleanEntry;
      });

      // Log the entries we're about to save
      console.log('Saving processed data entries:', processedEntries);

      // Upsert entries (insert or update)
      const { error } = await supabase
        .from('data_entries')
        .upsert(processedEntries, {
          onConflict: 'column_id,school_id,category_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('Supabase error saving data entries:', error);
        throw error;
      }

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
