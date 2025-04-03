
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useDataEntries = () => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchEntries = useCallback(async (filters?: Partial<DataEntry>) => {
    setLoading(true);
    try {
      let query = supabase.from('data_entries').select('*');

      // Rol əsaslı filtrasiya
      switch (user?.role) {
        case 'superadmin':
          // SuperAdmin bütün məlumatları görə bilər
          break;
        case 'regionadmin':
          query = query.eq('school_id', user.regionId);
          break;
        case 'sectoradmin':
          query = query.eq('school_id', user.sectorId);
          break;
        case 'schooladmin':
          query = query.eq('school_id', user.schoolId);
          break;
      }

      // Əlavə filtrlər
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      setEntries(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Məlumatları yükləyərkən xəta:', err);
      setError(err);
      setLoading(false);
      toast.error('Məlumatları yükləyərkən xəta baş verdi');
    }
  }, [user]);

  const addEntry = useCallback(async (entryData: Omit<DataEntry, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => [...prev, data]);
      toast.success('Məlumat uğurla əlavə edildi');
      return data;
    } catch (err: any) {
      console.error('Məlumat əlavə edərkən xəta:', err);
      toast.error('Məlumat əlavə edərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const updateEntry = useCallback(async (entryId: string, updateData: Partial<DataEntry>) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .update(updateData)
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? data : entry
      ));
      
      toast.success('Məlumat uğurla yeniləndi');
      return data;
    } catch (err: any) {
      console.error('Məlumat yenilənərkən xəta:', err);
      toast.error('Məlumat yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Məlumat uğurla silindi');
      return true;
    } catch (err: any) {
      console.error('Məlumat silinərkən xəta:', err);
      toast.error('Məlumat silinərkən xəta baş verdi');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry
  };
};
