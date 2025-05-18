
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';

export const fetchCategory = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No data found, return null
    }
    throw new Error(`Failed to fetch category: ${error.message}`);
  }
  
  return data;
};

export const useCategoryQuery = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => fetchCategory(id),
    enabled: !!id,
  });
};

export default useCategoryQuery;
