
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';

export const useSectorDataEntry = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDataEntry = useCallback(async (
    sectorId: string, 
    categoryId: string, 
    columnId: string, 
    value: string
  ) => {
    if (!user) {
      toast.error('Daxil olun');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('sector_data_entries')
        .insert({
          sector_id: sectorId,
          category_id: categoryId,
          column_id: columnId,
          value,
          created_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Məlumat yadda saxlanıldı');
      return data;
    } catch (err: any) {
      setError(err.message);
      toast.error('Xəta baş verdi');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSectorDataEntries = useCallback(async (
    sectorId: string, 
    categoryId?: string
  ) => {
    if (!user) {
      toast.error('Daxil olun');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('sector_data_entries')
        .select('*')
        .eq('sector_id', sectorId);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      setError(err.message);
      toast.error('Məlumatlar yüklənə bilmədi');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    saveDataEntry,
    fetchSectorDataEntries,
    isLoading,
    error
  };
};
