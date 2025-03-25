import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntry } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';

export const useDataEntries = (schoolId?: string, categoryId?: string, columnId?: string) => {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  const fetchDataEntries = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('data_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      } else if (user?.schoolId) {
        query = query.eq('school_id', user.schoolId);
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
  }, [schoolId, categoryId, columnId, user, t]);

  const addDataEntry = async (dataEntry: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const entryWithSchoolId = {
        ...dataEntry,
        school_id: dataEntry.school_id || user?.schoolId,
        created_by: user?.id,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('data_entries')
        .insert([entryWithSchoolId])
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

  const approveDataEntry = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setDataEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...data } as DataEntry : entry
      ));
      
      toast.success(t('dataEntryApproved'), {
        description: t('dataEntryApprovedDesc')
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

  const rejectDataEntry = async (id: string, rejectionReason: string) => {
    try {
      if (!rejectionReason) {
        throw new Error('Rejection reason is required');
      }

      const { data, error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setDataEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...data } as DataEntry : entry
      ));
      
      toast.success(t('dataEntryRejected'), {
        description: t('dataEntryRejectedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error rejecting data entry:', err);
      toast.error(t('errorOccurred'), {
        description: err.message || t('couldNotRejectData')
      });
      throw err;
    }
  };

  const getApprovalStatus = async (schoolId: string, categoryId?: string) => {
    try {
      let query = supabase
        .from('data_entries')
        .select('status')
        .eq('school_id', schoolId);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const statusCounts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      };
      
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

  const submitCategoryForApproval = async (categoryId: string, schoolId: string) => {
    try {
      if (!categoryId || !schoolId) {
        throw new Error('Category ID and School ID are required');
      }

      const { data, error } = await supabase.rpc('submit_category_for_approval', {
        p_category_id: categoryId,
        p_school_id: schoolId
      });

      if (error) throw error;
      
      await fetchDataEntries();
      
      toast.success(t('categorySubmitted'), {
        description: t('categorySubmittedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error submitting category for approval:', err);
      toast.error(t('errorOccurred'), {
        description: err.message || t('couldNotSubmitCategory')
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchDataEntries();
  }, [fetchDataEntries]);

  return {
    dataEntries,
    loading,
    error,
    fetchDataEntries,
    addDataEntry,
    updateDataEntry,
    deleteDataEntry,
    getApprovalStatus,
    approveDataEntry,
    rejectDataEntry,
    submitCategoryForApproval
  };
};
