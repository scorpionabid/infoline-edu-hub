
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';

export interface UseCategoriesWithAssignmentOptions {
  assignment?: 'all' | 'schools' | 'sectors';
  enabled?: boolean;
}

export const useCategoriesWithAssignment = (options: UseCategoriesWithAssignmentOptions = {}) => {
  const { assignment = 'schools', enabled = true } = options;

  return useQuery({
    queryKey: ['categories', 'assignment', assignment],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (assignment !== 'all') {
        query = query.in('assignment', ['all', assignment]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return (data || []) as Category[];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default useCategoriesWithAssignment;
