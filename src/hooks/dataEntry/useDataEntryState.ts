// Köhnə useDataEntryState hook-u yeni implementasiyaya yönləndirilir
/**
 * @deprecated Bu hook-un yeni versiyası @/hooks/business/dataEntry/useDataEntryState-də mövcuddur.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { indexDataEntriesByColumnId } from '@/utils/dataIndexing';

interface UseDataEntryStateProps {
  categoryId: string;
  schoolId: string;
}

/**
 * @deprecated Bu hook artıq köhnəlmişdir. Zəhmət olmasa @/hooks/business/dataEntry/useDataEntryState istifadə edin.
 */
export const useDataEntryState = ({ categoryId, schoolId }: UseDataEntryStateProps) => {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [entriesMap, setEntriesMap] = useState<Record<string, DataEntry>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  console.warn('useDataEntryState hook artıq köhnəlmişdir. Zəhmət olmasa @/hooks/business/dataEntry/useDataEntryState istifadə edin.');
  
  const fetchDataEntries = async () => {
    isLoading,
    isError,
    error: newError,
    updateAllEntries: saveDataEntries,
    refetch: fetchDataEntries
  } = useDataEntryStateNew({ categoryId, schoolId });
  
  // Xətanı uyğunlaşdırırıq
  const [error] = useState<string | null>(newError ? newError.message : null);
  
  // Köhnə funksiyaları yeni implementasiya ilə uyğunlaşdırırıq
  const _fetchDataEntries = async () => {
    // Safety check for required IDs
    if (!categoryId || !schoolId) {
      console.log('Missing required IDs for data entry fetch:', { categoryId, schoolId });
      setDataEntries([]);
      setError('Missing category or school ID');
      // Even on error, ensure entriesMap is a valid empty object
      setEntriesMap({});
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
        setEntriesMap({}); // Reset to empty object
        return;
      }
      
      if (!Array.isArray(data)) {
        console.error('Expected array from data_entries query but got:', typeof data);
        setDataEntries([]);
        setEntriesMap({}); // Reset to empty object
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
      
      // Create a lookup object using our standardized function
      const entriesLookup = indexDataEntriesByColumnId(safeEntries);
        
      // Store the lookup in our state for safe access
      setEntriesMap(entriesLookup);
      
      // Store both the array and lookup object
      setDataEntries(safeEntries);
      
      // Log the result for debugging
      console.log(`Successfully fetched ${safeEntries.length} data entries for category ${categoryId} and school ${schoolId}`);
      console.log('entriesLookup created with keys:', Object.keys(entriesLookup).length);
    } catch (err: any) {
      console.error('Error fetching data entries:', err);
      setError(err.message || 'Failed to fetch data entries');
      toast.error(`Failed to fetch data entries: ${err.message || 'Unknown error'}`);
      
      // Ensure entriesMap is always a valid object even on error
      setEntriesMap({});
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId]);

  // Köhnə useEffect-i silmişik, yeni hook özü məlumatları yükləyir

  // Köhnə funksiyaları yeni implementasiya ilə uyğunlaşdırırıq
  const _saveDataEntries = async (entries: any[]): Promise<boolean> => {
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

      // Update the local entriesLookup with newly saved entries
      const updatedLookup = { ...entriesMap };
      
      // Update our lookup with the new entries (preventing stale data)
      processedEntries.forEach(entry => {
        if (entry && entry.column_id) {
          updatedLookup[entry.column_id] = entry as DataEntry;
        }
      });
      
      setEntriesMap(updatedLookup);
      
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
    entriesMap, // Return the state directly (renamed from entriesLookup for clarity)
    entriesLookup: entriesMap, // Maintain backwards compatibility
    isLoading,
    error,
    saveDataEntries,
    fetchDataEntries
  };
};

export default useDataEntryState;
