
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
      if (assignment && assignment !== 'all') {
        query = query.in('assignment', [assignment, 'all']);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} categories`);
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
