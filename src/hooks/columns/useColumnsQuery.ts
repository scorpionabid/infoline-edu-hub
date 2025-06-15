
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType, ColumnOption } from '@/types/column';
import { transformRawColumnData } from '@/utils/columnOptionsParser';

interface UseColumnsQueryOptions {
  categoryId?: string;
  status?: 'all' | 'active' | 'inactive' | 'deleted';
  enabled?: boolean;
}

export const useColumnsQuery = (options: UseColumnsQueryOptions = {}) => {
  const { categoryId, status = 'active', enabled = true } = options;

  return useQuery({
    queryKey: ['columns', categoryId, status],
    queryFn: async (): Promise<Column[]> => {
      let query = supabase
        .from('columns')
        .select('*')
        .order('order_index', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }

      // Type conversion for column data with proper transformation
      return (data || []).map(column => {
        const transformed = transformRawColumnData(column);
        return {
          ...column,
          type: column.type as ColumnType,
          options: transformed.options || [],
          validation: column.validation || {},
          description: transformed.description || column.description || '',
          section: column.section || ''
        } as Column;
      });
    },
    enabled: enabled
  });
};
