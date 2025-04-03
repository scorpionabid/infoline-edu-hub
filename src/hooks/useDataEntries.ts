
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/supabase';

export const useDataEntries = (schoolId?: string, categoryId?: string, columnId?: string) => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('data_entries')
      .select('*');

    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (columnId) {
      query = query.eq('column_id', columnId);
    }

    try {
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setEntries(data || []);
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [schoolId, categoryId, columnId]);

  const addEntry = async (entry: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert([entry]);

      if (error) {
        throw error;
      }

      await fetchEntries();
      return true;
    } catch (error: any) {
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (id: string, updates: Partial<DataEntry>) => {
    setLoading(true);
    setError(null);

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
    } catch (error: any) {
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    setLoading(true);
    setError(null);

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
    } catch (error: any) {
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addEntries = async (entries: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      // Təqdim edilən məlumatların tipini yoxlayaq və düzəldək
      const formattedEntries = entries.map(entry => ({
        category_id: entry.category_id,
        column_id: entry.column_id, 
        school_id: entry.school_id,
        created_by: entry.created_by,
        status: entry.status || 'pending',
        value: entry.value
      }));

      const { data, error } = await supabase
        .from('data_entries')
        .insert(formattedEntries);

      if (error) {
        throw error;
      }

      await fetchEntries();
      return true;
    } catch (error) {
      console.error('Məlumatları əlavə edərkən xəta:', error);
      return false;
    }
  };

  const getApprovalStatus = async (schoolId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('status')
        .eq('school_id', schoolId);

      if (error) {
        throw error;
      }

      // Hesablama əməliyyatlarını yerinə yetirək
      const status = data.reduce((acc: Record<string, number>, curr) => {
        if (!acc[curr.status]) {
          acc[curr.status] = 0;
        }
        acc[curr.status]++;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0 });

      return status;
    } catch (error) {
      console.error('Məlumat status tələbində xəta:', error);
      return { pending: 0, approved: 0, rejected: 0 };
    }
  };

  const submitCategoryForApproval = async (categoryId: string, schoolId: string) => {
    try {
      // Kateqoriya məlumatlarını pending statusuna yeniləyək
      const { data, error } = await supabase
        .from('data_entries')
        .update({ status: 'pending' })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Kateqoriya təsdiqi tələbində xəta:', error);
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
    addEntries,
    getApprovalStatus,
    submitCategoryForApproval
  };
};

export default useDataEntries;
