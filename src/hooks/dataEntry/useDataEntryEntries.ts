
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';

export function useDataEntryEntries() {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [isDataModified, setIsDataModified] = useState(false);

  const loadDataForSchool = useCallback(async (schoolId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId);

      if (error) throw error;
      if (data && Array.isArray(data)) {
        setEntries(data);
      }
      setIsDataModified(false);
    } catch (err) {
      setEntries([]);
      setIsDataModified(false);
    }
  }, []);

  const handleEntriesChange = useCallback((updatedEntries: DataEntry[]) => {
    setEntries(updatedEntries);
    setIsDataModified(true);
  }, []);

  return {
    entries,
    setEntries,
    isDataModified,
    setIsDataModified,
    loadDataForSchool,
    handleEntriesChange,
  };
}
