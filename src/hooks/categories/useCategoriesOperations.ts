
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreateCategoryData {
  name: string;
  description?: string;
  assignment?: string;
  deadline?: string;
  priority?: number;
}

export interface UpdateCategoryData {
  id: string;
  name?: string;
  description?: string;
  assignment?: string;
  deadline?: string;
  priority?: number;
}

export const useCategoriesOperations = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('archived', false)
        .order('order_index');
      
      if (error) throw error;
      return data;
    }
  });

  const createCategory = useMutation({
    mutationFn: async (categoryData: CreateCategoryData) => {
      const insertData = {
        name: categoryData.name,
        description: categoryData.description,
        assignment: categoryData.assignment || 'all',
        deadline: categoryData.deadline ? new Date(categoryData.deadline).toISOString() : null,
        priority: categoryData.priority || 1,
        order_index: 0,
        status: 'active',
        archived: false
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Kateqoriya yaradıldı');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error('Kateqoriya yaradılarkən xəta baş verdi');
      console.error(error);
    }
  });

  const updateCategory = useMutation({
    mutationFn: async (categoryData: UpdateCategoryData) => {
      const { id, ...updates } = categoryData;
      const updateData = {
        ...updates,
        deadline: updates.deadline ? new Date(updates.deadline).toISOString() : null
      };

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Kateqoriya yeniləndi');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error('Kateqoriya yenilənərkən xəta baş verdi');
      console.error(error);
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .update({ archived: true })
        .eq('id', categoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Kateqoriya silindi');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error('Kateqoriya silinərkən xəta baş verdi');
      console.error(error);
    }
  });

  const fetchCategories = async () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  return {
    categories,
    isLoading,
    error,
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
    fetchCategories
  };
};
