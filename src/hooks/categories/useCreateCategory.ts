import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreateCategoryData {
  name: string;
  description?: string | null;
  assignment?: string;
  priority?: number;
  status?: string;
}

/**
 * Hook to create a new category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: CreateCategoryData) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          assignment: categoryData.assignment || 'all',
          priority: categoryData.priority || 0,
          status: categoryData.status || 'active',
          archived: false,
          column_count: 0,
          order_index: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      console.error('Error creating category:', error);
    }
  });

  return {
    createCategory: createCategoryMutation.mutateAsync,
    isLoading: createCategoryMutation.isPending
  };
};

export default useCreateCategory;
