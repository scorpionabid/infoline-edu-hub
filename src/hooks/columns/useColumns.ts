
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';

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

      return data || [];
    },
    enabled: !!categoryId || categoryId === undefined
  });
};
