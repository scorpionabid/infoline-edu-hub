
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { useAuth } from '@/context/auth';

export const useCategories = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Kateqoriyaları çəkmək üçün funksiya - RLS ilə filtrələnəcək
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at');

    if (error) {
      throw error;
    }

    return data as Category[];
  };

  // Bir kateqoriyanı əldə etmək üçün funksiya
  const fetchCategory = async (id: string) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as Category;
  };

  // Yeni kateqoriya əlavə etmək üçün funksiya - SuperAdmin üçün
  const addCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select();

    if (error) {
      throw error;
    }

    return data[0] as Category;
  };

  // Kateqoriyanı yeniləmək üçün funksiya - SuperAdmin üçün
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return data[0] as Category;
  };

  // Kateqoriyanı silmək üçün funksiya - SuperAdmin üçün
  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  };

  // React Query hooks
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories,
    isLoading,
    isError,
    error,
    refetch,
    fetchCategory,
    addCategory: addCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    isAddingCategory: addCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,
  };
};
