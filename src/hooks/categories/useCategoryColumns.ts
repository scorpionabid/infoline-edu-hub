
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';

export const fetchCategoryColumns = async (categoryId: string): Promise<Column[]> => {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('category_id', categoryId)
    .order('order_index');
    
  if (error) {
    throw new Error(`Failed to fetch columns: ${error.message}`);
  }
  
  return data || [];
};

export const useCategoryColumns = (categoryId: string) => {
  return useQuery({
    queryKey: ['category_columns', categoryId],
    queryFn: () => fetchCategoryColumns(categoryId),
    enabled: !!categoryId,
  });
};

export default useCategoryColumns;
