
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Column } from "@/types/column";

/**
 * Hook to fetch columns for a specific category
 */
const useCategoryColumns = (categoryId: string | undefined) => {
  const query = useQuery({
    queryKey: ['category-columns', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      return data as Column[];
    },
    enabled: !!categoryId
  });
  
  return query;
};

export default useCategoryColumns;
