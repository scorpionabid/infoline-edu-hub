
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types/category";

/**
 * Hook to fetch a single category by ID
 */
const useCategoryQuery = (categoryId: string | undefined) => {
  const query = useQuery({
    queryKey: ['categories', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();
        
      if (error) throw error;
      return data as Category;
    },
    enabled: !!categoryId
  });
  
  return query;
};

export default useCategoryQuery;
