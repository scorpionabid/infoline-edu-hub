
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntry } from '@/types/supabase';

export const useDataEntries = (schoolId?: string, categoryId?: string) => {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchDataEntries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('data_entries')
        .select('*');
      
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
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

  const addDataEntry = async (entry: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      
      setDataEntries(prev => [...prev, data as DataEntry]);
      toast.success(t('dataSaved'), {
        description: t('dataSavedDesc')
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
      
      toast.success(t('dataUpdated'), {
        description: t('dataUpdatedDesc')
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
      
      toast.success(t('dataDeleted'), {
        description: t('dataDeletedDesc')
      });
    } catch (err: any) {
      console.error('Error deleting data entry:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteData')
      });
      throw err;
    }
  };

  const approveDataEntry = async (id: string, approvedBy: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setDataEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...data } as DataEntry : entry
      ));
      
      toast.success(t('dataApproved'), {
        description: t('dataApprovedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error approving data entry:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotApproveData')
      });
      throw err;
    }
  };

  const rejectDataEntry = async (id: string, rejectedBy: string, rejectionReason: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_by: rejectedBy,
          rejection_reason: rejectionReason
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setDataEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...data } as DataEntry : entry
      ));
      
      toast.success(t('dataRejected'), {
        description: t('dataRejectedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error rejecting data entry:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotRejectData')
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchDataEntries();
  }, [schoolId, categoryId]);

  return {
    dataEntries,
    loading,
    error,
    fetchDataEntries,
    addDataEntry,
    updateDataEntry,
    deleteDataEntry,
    approveDataEntry,
    rejectDataEntry
  };
};
