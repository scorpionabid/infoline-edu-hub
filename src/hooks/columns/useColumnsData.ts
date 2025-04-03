
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

export const useColumnsData = (categoryId?: string) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Kateqoriya üçün sütunları əldə etmə
  const fetchColumns = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('columns').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('order_index');

      if (error) throw error;

      setColumns(data || []);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Sütunları yükləyərkən xəta:', err);
      setError(err);
      setIsLoading(false);
      toast.error('Sütunlar yüklənərkən xəta baş verdi');
    }
  }, [categoryId]);

  // Yeni sütun yaratma
  const createColumn = useCallback(async (columnData: Omit<Column, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          ...columnData,
          id: uuid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setColumns(prev => [...prev, data]);
      toast.success('Sütun uğurla yaradıldı');
      return data;
    } catch (err: any) {
      console.error('Sütun yaradılarkən xəta:', err);
      toast.error('Sütun yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Sütunu yeniləmə
  const updateColumn = useCallback(async (columnData: Column) => {
    try {
      const { data, error } = await supabase
        .from('columns')
        .update({
          ...columnData,
          updated_at: new Date().toISOString()
        })
        .eq('id', columnData.id)
        .select()
        .single();

      if (error) throw error;

      setColumns(prev => prev.map(col => 
        col.id === columnData.id ? data : col
      ));
      
      toast.success('Sütun uğurla yeniləndi');
      return data;
    } catch (err: any) {
      console.error('Sütun yenilənərkən xəta:', err);
      toast.error('Sütun yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Sütunu silmə
  const deleteColumn = useCallback(async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      setColumns(prev => prev.filter(col => col.id !== columnId));
      toast.success('Sütun uğurla silindi');
      return true;
    } catch (err: any) {
      console.error('Sütun silinərkən xəta:', err);
      toast.error('Sütun silinərkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Komponentin ilkin yüklənməsi zamanı
  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  return {
    columns,
    isLoading,
    error,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn
  };
};
