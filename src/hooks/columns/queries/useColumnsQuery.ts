
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType } from '@/types/column';

interface UseColumnsQueryOptions {
  categoryId?: string;
  status?: string;
  enabled?: boolean;
}

export const useColumnsQuery = (options: UseColumnsQueryOptions = {}) => {
  const { categoryId, status = 'active', enabled = true } = options;
  
  return useQuery({
    queryKey: ['columns', categoryId, status],
    queryFn: async (): Promise<Column[]> => {
      let query = supabase
        .from('columns')
        .select('*');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('order_index');

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }

      return (data || []).map(column => ({
        ...column,
        type: column.type as ColumnType,
        status: column.status as 'active' | 'inactive' | 'deleted',
        options: column.options ? 
          (typeof column.options === 'string' ? JSON.parse(column.options) : column.options) : 
          [],
        validation: column.validation ? 
          (typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation) : 
          {}
      }));
    },
    enabled
  });
};
