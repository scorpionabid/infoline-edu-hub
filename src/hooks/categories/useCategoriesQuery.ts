
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Category, CategoryFilter } from "@/types/category";

/**
 * Hook to fetch categories with optional filtering
 */
const useCategoriesQuery = (filters?: Partial<CategoryFilter>) => {
  const query = useQuery({
    queryKey: ['categories', filters],
    queryFn: async () => {
      let query = supabase.from('categories').select('*');
      
      // Apply filters if provided
      if (filters) {
        if (filters.search && filters.search.trim()) {
          query = query.ilike('name', `%${filters.search.trim()}%`);
        }
        
        if (filters.status && filters.status !== '') {
          query = query.eq('status', filters.status);
        }
        
        if (filters.assignment && filters.assignment !== '') {
          query = query.eq('assignment', filters.assignment);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Category[];
    }
  });
  
  return query;
};

export default useCategoriesQuery;
