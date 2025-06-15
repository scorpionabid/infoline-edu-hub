import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, CategoryAssignment } from '@/types/category';

interface UseCategoryQueryOptions {
  categoryId?: string;
  withColumns?: boolean;
  assignment?: CategoryAssignment;
  status?: string;
  enabled?: boolean;
}

export const useCategoryQuery = (options: UseCategoryQueryOptions = {}) => {
  const { 
    categoryId, 
    withColumns = false, 
    assignment, 
    status = 'active',
    enabled = true 
  } = options;
  
  return useQuery({
    queryKey: ['categories', categoryId, withColumns, assignment, status],
    queryFn: async (): Promise<CategoryWithColumns[]> => {
      let query = supabase
        .from('categories')
        .select(withColumns ? `*,columns(*)` : '*');

      if (categoryId) {
        query = query.eq('id', categoryId);
      }

      if (assignment) {
        query = query.eq('assignment', assignment);
      }

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('order_index');

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // Defensive conversion
      return (Array.isArray(data) ? data : [])
        .filter(category => typeof category === 'object' && category && 'id' in category)
        .map((category: any) => ({
          ...category,
          assignment: category.assignment,
          columns: withColumns && Array.isArray(category.columns)
            ? (category.columns || []).map((column: any) => ({
                ...column,
                options: column.options ? 
                  (typeof column.options === 'string' ? JSON.parse(column.options) : column.options) : 
                  [],
                validation: column.validation ? 
                  (typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation) : 
                  {}
              })) : []
        })) as CategoryWithColumns[];
    },
    enabled
  });
};

export default useCategoryQuery;
