
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { toast } from 'sonner';

const useColumns = (categoryId: string) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getColumns = useCallback(async () => {
    if (!categoryId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      setColumns(data || []);
    } catch (error) {
      console.error('Sütunları əldə edərkən xəta:', error);
      toast.error('Sütunları yükləmək mümkün olmadı');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  const deleteColumn = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Sütun silindikdən sonra siyahını yeniləyirik
      setColumns(prevColumns => 
        prevColumns.filter(column => column.id !== id)
      );

      return true;
    } catch (error) {
      console.error('Sütunu silmək mümkün olmadı:', error);
      return false;
    }
  }, []);

  return {
    columns,
    isLoading,
    getColumns,
    deleteColumn
  };
};

export default useColumns;
