
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
        // Verilənlər bazasından gələn məlumatları DataEntry tipinə çevirmə
        const typedEntries: DataEntry[] = data.map(entry => ({
          id: entry.id,
          column_id: entry.column_id,
          school_id: entry.school_id,
          category_id: entry.category_id,
          value: entry.value || '',
          status: (entry.status as 'pending' | 'approved' | 'rejected') || 'pending',
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          created_by: entry.created_by,
          approved_at: entry.approved_at,
          approved_by: entry.approved_by,
          rejected_by: entry.rejected_by,
          rejection_reason: entry.rejection_reason
        }));
        
        setEntries(typedEntries);
      }
      setIsDataModified(false);
    } catch (err) {
      console.error('Məlumatları yükləyərkən xəta:', err);
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
