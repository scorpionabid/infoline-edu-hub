
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';

interface UseColumnsQueryOptions {
  categoryId?: string;
  enabled?: boolean;
}

export const useColumnsQuery = ({ categoryId, enabled = true }: UseColumnsQueryOptions) => {
  return useQuery({
    queryKey: ['columns', categoryId],
    queryFn: async () => {
      let query = supabase.from('columns').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('order_index');
      
      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }
      
      return (data || []) as Column[];
    },
    enabled: enabled
  });
};

export default useColumnsQuery;
