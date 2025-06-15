
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType } from '@/types/column';
import { transformRawColumnData } from '@/utils/columnOptionsParser';

interface UseColumnsOptions {
  categoryId?: string;
}

export const useColumns = (options: UseColumnsOptions = {}) => {
  const { categoryId } = options;

  return useQuery({
    queryKey: ['columns', categoryId],
    queryFn: async (): Promise<Column[]> => {
      let query = supabase
        .from('columns')
        .select('*')
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }

      // Properly transform the data to match Column interface
      return (data || []).map(item => {
        const transformed = transformRawColumnData(item);
        return {
          ...item,
          type: item.type as ColumnType,
          options: transformed.options || [],
          validation: item.validation || {},
          description: transformed.description || item.description || '',
          section: item.section || ''
        } as Column;
      });
    },
    enabled: !!categoryId || categoryId === undefined
  });
};
