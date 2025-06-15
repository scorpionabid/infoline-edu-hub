
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryAssignment } from '@/types/category';

export interface UseCategoriesWithAssignmentOptions {
  assignment?: CategoryAssignment;
  enabled?: boolean;
  strictMode?: boolean; // Əlavə edilən parametr
}

export const useCategoriesWithAssignment = (options: UseCategoriesWithAssignmentOptions = {}) => {
  const { assignment = 'all', enabled = true, strictMode = false } = options;

  return useQuery({
    queryKey: ['categories', 'assignment', assignment, strictMode],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      // Strict mode: yalnız müəyyən assignment
      if (strictMode) {
        query = query.eq('assignment', assignment);
      } else {
        // Normal mode: həm 'all' həm də müəyyən assignment
        if (assignment !== 'all') {
          query = query.in('assignment', ['all', assignment]);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log('Categories fetched:', data?.map(c => ({ id: c.id, name: c.name, assignment: c.assignment })));
      return (data || []) as Category[];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// School categories üçün xüsusi hook
export const useSchoolCategories = (options: UseCategoriesWithAssignmentOptions = {}) => {
  return useCategoriesWithAssignment({
    assignment: 'all',
    strictMode: true, // Yalnız 'all' assignment-li kateqoriyalar
    ...options
  });
};

export default useCategoriesWithAssignment;
