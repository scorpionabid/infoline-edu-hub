
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';

interface UseCategoriesQueryOptions {
  assignment?: 'all' | 'schools' | 'sectors';
  enabled?: boolean;
}

export const useCategoriesQuery = ({ 
  assignment,
  enabled = true 
}: UseCategoriesQueryOptions = {}) => {
  const {
    data: categories = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories', assignment],
    queryFn: async (): Promise<Category[]> => {
      console.log('Fetching categories with assignment filter:', assignment);
      
      let query = supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('order_index');

      // Apply assignment filter if specified
      // Note: We don't filter by assignment here to get all categories
      // Role-based filtering will be done in the CategorySelector component
      if (assignment && assignment !== 'all') {
        // For specific assignments, include both the assignment and 'all' categories
        query = query.in('assignment', [assignment, 'all']);
      }
      // If assignment is 'all' or undefined, get all categories

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} categories`);
      console.log('Categories data:', data);
      // Debug each category assignment
      data?.forEach((cat, index) => {
        console.log(`Category ${index}:`, {
          id: cat.id,
          name: cat.name,
          assignment: cat.assignment,
          status: cat.status
        });
      });
      return data as Category[];
    },
    enabled
  });

  return {
    categories,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
