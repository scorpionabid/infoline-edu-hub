
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category } from '@/types/category';

export interface CreateCategoryData {
  name: string;
  description?: string;
  assignment?: string;
  priority?: number;
  status?: string;
}

export const useCategoryOperations = () => {
  const queryClient = useQueryClient();

  const fetchCategories = async (searchQuery: string = '', filters: any = {}) => {
    let query = supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.assignment) {
      query = query.eq('assignment', filters.assignment);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(category => ({
      ...category,
      assignment: category.assignment || 'all',
      archived: category.archived || false,
      column_count: category.column_count || 0,
      priority: category.priority || 0,
      status: category.status || 'active'
    }));
  };

  const addCategoryMutation = useMutation({
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
      toast.success('Kateqoriya uğurla yaradıldı');
    },
    onError: (error: Error) => {
      toast.error('Kateqoriya yaradılarkən xəta baş verdi');
      console.error('Error creating category:', error);
    }
  });

  const addCategory = async (categoryData: CreateCategoryData) => {
    return addCategoryMutation.mutateAsync(categoryData);
  };

  return {
    fetchCategories,
    addCategory,
    isLoading: addCategoryMutation.isPending,
    error: null
  };
};
