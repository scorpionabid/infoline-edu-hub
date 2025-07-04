
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryAssignment, CategoryStatus } from '@/types/category';

interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  assignment: CategoryAssignment;
  created_at: string;
  updated_at: string;
  order_index?: number;
  priority?: number;
  deadline?: string;
}

interface CreateCategoryData {
  name: string;
  description?: string;
  assignment?: CategoryAssignment;
  status?: CategoryStatus;
  order_index?: number;
  priority?: number;
  deadline?: string;
}

interface UpdateCategoryData {
  name: string;
  description?: string;
}

const useCategoriesQuery = () => {
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Category[];
    }
  });

  const createCategory = useMutation({
    mutationFn: async (categoryData: CreateCategoryData) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          order_index: categoryData.order_index || 0,
          status: categoryData.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryData }) => {
      const { data: updatedData, error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  return {
    categories: categories || [],
    isLoading,
    error,
    createCategory: createCategory.mutateAsync,
    updateCategory: ({ id, data }: { id: string; data: UpdateCategoryData }) => 
      updateCategory.mutateAsync({ id, data }),
    deleteCategory: deleteCategory.mutateAsync,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  };
};

export default useCategoriesQuery;
