
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, Category } from '@/types/category';
import { toast } from 'sonner';

export const useCategoriesQuery = () => {
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoryWithColumns[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns:columns(*)
        `)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as CategoryWithColumns[];
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<CategoryWithColumns> => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select(`
          *,
          columns:columns(*)
        `)
        .single();

      if (error) throw error;
      return data as CategoryWithColumns;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }): Promise<CategoryWithColumns> => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          columns:columns(*)
        `)
        .single();

      if (error) throw error;
      return data as CategoryWithColumns;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category');
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });

  return {
    categories,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: (id: string, updates: Partial<Category>) => 
      updateCategoryMutation.mutateAsync({ id, updates }),
    deleteCategory: deleteCategoryMutation.mutateAsync,
  };
};
