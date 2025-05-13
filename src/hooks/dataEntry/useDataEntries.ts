
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';

const useDataEntries = (categoryId: string, schoolId: string) => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();

  const fetchEntries = useCallback(async () => {
    if (!categoryId || !schoolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .is('deleted_at', null);
        
      if (error) throw error;
      
      if (data) {
        // Type cast the data entries to include proper status type
        const typedEntries: DataEntry[] = data.map(entry => ({
          ...entry,
          status: entry.status as DataEntryStatus
        }));
        
        setEntries(typedEntries);
      }
    } catch (err: any) {
      setError(err);
      toast.error(t('errorLoadingEntries'), {
        description: err.message
      });
      console.error('Error loading data entries:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, schoolId, t]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);
  
  return {
    entries,
    loading,
    error,
    refreshEntries: fetchEntries
  };
};

export default useDataEntries;
