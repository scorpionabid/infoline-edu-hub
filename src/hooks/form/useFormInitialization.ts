
import { useState, useEffect } from 'react';
import { DataEntry, DataEntryForm, DataEntrySaveStatus, EntryValue } from '@/types/dataEntry';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

interface UseFormInitializationProps {
  schoolId: string;
  categoryId: string;
}

export const useFormInitialization = ({ schoolId, categoryId }: UseFormInitializationProps) => {
  const [form, setForm] = useState<DataEntryForm>({
    entries: [],
    isModified: false,
    saveStatus: DataEntrySaveStatus.IDLE,
    error: null,
    schoolId,
    categoryId,
    status: 'draft'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!schoolId || !categoryId) {
      setIsLoading(false);
      return;
    }

    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('data_entries')
          .select('*')
          .eq('school_id', schoolId)
          .eq('category_id', categoryId);

        if (error) throw error;

        // Transform DB entries to form entries
        const formEntries: EntryValue[] = data?.map(entry => ({
          id: entry.id,
          columnId: entry.column_id,
          value: entry.value,
          status: entry.status
        })) || [];

        setForm(prev => ({
          ...prev,
          entries: formEntries,
          status: data?.length > 0 ? (data[0].status as any) : 'draft',
          isModified: false,
          saveStatus: DataEntrySaveStatus.IDLE,
          error: null
        }));
      } catch (err: any) {
        console.error('Error fetching form entries:', err);
        setForm(prev => ({
          ...prev,
          error: err.message || 'Məlumatları yükləmək mümkün olmadı'
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [schoolId, categoryId]);

  return {
    form,
    setForm,
    isLoading
  };
};

export default useFormInitialization;
