
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/supabase';

export const useDataEntries = () => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*');

      if (error) {
        throw error;
      }

      setEntries(data || []);
    } catch (error: any) {
      setError(error);
      console.error('Məlumatları əldə edərkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const addEntry = async (entry: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert([entry])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchEntries();
      return data;
    } catch (error) {
      console.error('Məlumat əlavə edərkən xəta:', error);
      throw error;
    }
  };

  const updateEntry = async (id: string, updates: Partial<DataEntry>) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Məlumatı yeniləyərkən xəta:', error);
      return false;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Məlumatı silərkən xəta:', error);
      return false;
    }
  };

  const approveEntry = async (id: string, approverId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Məlumatı təsdiqləyərkən xəta:', error);
      return false;
    }
  };

  const rejectEntry = async (id: string, rejectorId: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_by: rejectorId,
          rejection_reason: reason
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Məlumatı rədd edərkən xəta:', error);
      return false;
    }
  };

  const getApprovalStatus = (categoryId: string, schoolId: string) => {
    const categoryEntries = entries.filter(
      entry => entry.category_id === categoryId && entry.school_id === schoolId
    );
    
    if (categoryEntries.length === 0) return 'pending';
    
    if (categoryEntries.every(entry => entry.status === 'approved')) {
      return 'approved';
    }
    
    if (categoryEntries.some(entry => entry.status === 'rejected')) {
      return 'rejected';
    }
    
    return 'pending';
  };

  const submitCategoryForApproval = async (categoryId: string, schoolId: string) => {
    try {
      // Kateqoriyaya aid bütün məlumatları tapaq
      const categoryEntries = entries.filter(
        entry => entry.category_id === categoryId && entry.school_id === schoolId
      );
      
      // Əgər heç bir məlumat yoxdursa, error qaytaraq
      if (categoryEntries.length === 0) {
        console.error('Təsdiq üçün məlumatlar tapılmadı');
        return false;
      }
      
      // Bütün məlumatları 'pending' statusuna keçirək
      const updatePromises = categoryEntries.map(entry => {
        if (entry.status !== 'pending') {
          return updateEntry(entry.id, { status: 'pending' });
        }
        return Promise.resolve(true);
      });
      
      await Promise.all(updatePromises);
      
      console.log(`Kateqoriya ID: ${categoryId} və Məktəb ID: ${schoolId} təsdiqə göndərildi`);
      return true;
    } catch (error) {
      console.error('Kateqoriyanı təsdiqə göndərərkən xəta:', error);
      return false;
    }
  };

  return {
    entries,
    loading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    approveEntry,
    rejectEntry,
    submitCategoryForApproval,
    getApprovalStatus
  };
};

export default useDataEntries;
