
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';

export const useDataEntries = (schoolId: string, categoryId: string) => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!schoolId || !categoryId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) throw error;

      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching data entries:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch entries'));
      toast.error('Məlumatları yükləmək mümkün olmadı');
    } finally {
      setLoading(false);
    }
  }, [schoolId, categoryId]);

  const createOrUpdateEntry = useCallback(async (entry: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Check if entry with this column_id already exists
      const { data: existingEntries } = await supabase
        .from('data_entries')
        .select('id')
        .eq('school_id', entry.school_id || schoolId)
        .eq('category_id', entry.category_id || categoryId)
        .eq('column_id', entry.column_id);

      let result;

      if (existingEntries && existingEntries.length > 0) {
        // Update existing entry
        result = await supabase
          .from('data_entries')
          .update({
            value: entry.value,
            status: entry.status || 'draft'
          })
          .eq('id', existingEntries[0].id)
          .select();
      } else {
        // Create new entry
        result = await supabase
          .from('data_entries')
          .insert({
            column_id: entry.column_id,
            school_id: entry.school_id || schoolId,
            category_id: entry.category_id || categoryId,
            value: entry.value,
            status: entry.status || 'draft'
          })
          .select();
      }

      if (result.error) throw result.error;

      // Update local state
      fetchEntries();

      return result.data[0];
    } catch (err) {
      console.error('Error creating/updating entry:', err);
      toast.error('Məlumatı saxlamaq mümkün olmadı');
      throw err;
    }
  }, [schoolId, categoryId, fetchEntries]);

  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      // Update local state
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      toast.success('Məlumat silindi');

      return true;
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('Məlumatı silmək mümkün olmadı');
      throw err;
    }
  }, []);

  return {
    entries,
    loading,
    error,
    fetchEntries,
    createOrUpdateEntry,
    deleteEntry
  };
};
