import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

export interface UseBaseDataEntryOptions {
  categoryId: string;
  schoolId?: string;
  sectorId?: string;
  enabled?: boolean;
}

export interface UseBaseDataEntryResult {
  entries: DataEntry[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isSaving: boolean;
  saveEntries: (entries: Partial<DataEntry>[]) => Promise<void>;
  updateStatus: (params: {
    entries: DataEntry[];
    status: DataEntryStatus;
    comment?: string;
  }) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useBaseDataEntry = ({
  categoryId,
  schoolId,
  sectorId,
  enabled = true
}: UseBaseDataEntryOptions): UseBaseDataEntryResult => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const user = useAuthStore(state => state.user);

  const fetchEntries = useCallback(async () => {
    if (!enabled || !categoryId || (!schoolId && !sectorId)) return;

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      let query = supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId);

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId, sectorId, enabled]);

  const saveEntries = useCallback(async (entriesToSave: Partial<DataEntry>[]) => {
    if (!user || entriesToSave.length === 0) return;

    try {
      setIsSaving(true);

      // Məlumatları hazırla
      const formattedEntries = entriesToSave.map(entry => ({
        ...entry,
        category_id: categoryId,
        school_id: schoolId || entry.school_id || '',
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: saveError } = await supabase
        .from('data_entries')
        .upsert(formattedEntries, {
          onConflict: 'school_id,category_id,column_id'
        });

      if (saveError) throw saveError;

      // Yenidən yüklə
      await fetchEntries();
    } catch (err) {
      console.error('Error saving entries:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [user, categoryId, schoolId, fetchEntries]);

  const updateStatus = useCallback(async ({
    entries: entriesToUpdate,
    status,
    comment
  }: {
    entries: DataEntry[];
    status: DataEntryStatus;
    comment?: string;
  }) => {
    try {
      setIsSaving(true);

      const updates = entriesToUpdate.map(entry => ({
        ...entry,
        status,
        updated_at: new Date().toISOString()
      }));

      const { error: updateError } = await supabase
        .from('data_entries')
        .upsert(updates, {
          onConflict: 'id'
        });

      if (updateError) throw updateError;

      await fetchEntries();
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [fetchEntries]);

  const refetch = useCallback(async () => {
    await fetchEntries();
  }, [fetchEntries]);

  // İlk yükləmə
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    isLoading,
    isError,
    error,
    isSaving,
    saveEntries,
    updateStatus,
    refetch
  };
};

export default useBaseDataEntry;
