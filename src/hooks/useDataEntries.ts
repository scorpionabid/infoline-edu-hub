
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntry } from '@/types/supabase';

export const useDataEntries = (schoolId?: string, categoryId?: string, columnId?: string) => {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchDataEntries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('data_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      if (columnId) {
        query = query.eq('column_id', columnId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setDataEntries(data as DataEntry[]);
    } catch (err: any) {
      console.error('Error fetching data entries:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadDataEntries')
      });
    } finally {
      setLoading(false);
    }
  };

  const addDataEntry = async (dataEntry: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert([dataEntry])
        .select()
        .single();

      if (error) throw error;
      
      setDataEntries(prev => [data as DataEntry, ...prev]);
      toast.success(t('dataEntrySaved'), {
        description: t('dataEntrySavedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error adding data entry:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotSaveData')
      });
      throw err;
    }
  };

  const updateDataEntry = async (id: string, updates: Partial<DataEntry>) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setDataEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...data } as DataEntry : entry
      ));
      
      toast.success(t('dataEntryUpdated'), {
        description: t('dataEntryUpdatedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error updating data entry:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateData')
      });
      throw err;
    }
  };

  const deleteDataEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDataEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast.success(t('dataEntryDeleted'), {
        description: t('dataEntryDeletedDesc')
      });
    } catch (err: any) {
      console.error('Error deleting data entry:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteData')
      });
      throw err;
    }
  };

  // Məktəb üçün bütün datanın təsdiq statusunu əldə etmək
  const getApprovalStatus = async (schoolId: string, categoryId?: string) => {
    try {
      // Əvvəlki group metodu əvəzinə ayrı-ayrı sorğular edək
      // və nəticələri birləşdirək
      let query = supabase
        .from('data_entries')
        .select('status, id')
        .eq('school_id', schoolId);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Status və saylar obyekti yaratmaq
      const statusCounts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      };
      
      // Əl ilə sayma əməliyyatı
      if (data && data.length > 0) {
        data.forEach((item: any) => {
          const status = item.status as keyof typeof statusCounts;
          if (status in statusCounts) {
            statusCounts[status] += 1;
            statusCounts.total += 1;
          }
        });
      }
      
      return statusCounts;
    } catch (err) {
      console.error('Error fetching approval status:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDataEntries();
  }, [schoolId, categoryId, columnId]);

  return {
    dataEntries,
    loading,
    error,
    fetchDataEntries,
    addDataEntry,
    updateDataEntry,
    deleteDataEntry,
    getApprovalStatus
  };
};
