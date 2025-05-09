
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';

interface UseColumnsQueryOptions {
  categoryId?: string;
  enabled?: boolean;
}

export const useColumnsQuery = ({ categoryId, enabled = true }: UseColumnsQueryOptions) => {
  const fetchColumns = async (): Promise<Column[]> => {
    if (!categoryId) return [];

    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index');

    if (error) throw error;
    
    // Transform the data to match the Column interface
    if (data) {
      return data.map(column => ({
        ...column,
        options: column.options ? (typeof column.options === 'string' ? JSON.parse(column.options) : column.options) : undefined,
        validation: column.validation ? (typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation) : undefined
      })) as Column[];
    }
    
    return [];
  };

  return useQuery({
    queryKey: ['columns', categoryId],
    queryFn: fetchColumns,
    enabled: Boolean(categoryId) && enabled
  });
};

export default useColumnsQuery;
