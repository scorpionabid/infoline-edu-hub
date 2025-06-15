
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category } from '@/types/category';

export interface CreateCategoryData {
  name: string;
  description?: string;
  assignment?: 'all' | 'schools' | 'sectors';
  order_index?: number;
  priority?: number;
  deadline?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

export const useCategoryOperations = () => {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const { data: result, error } = await supabase
        .from('categories')
        .insert([{
          ...data,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kateqoriya uğurla yaradıldı');
    },
    onError: (error) => {
      console.error('Create category error:', error);
      toast.error('Kateqoriya yaradılarkən xəta baş verdi');
    }
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: UpdateCategoryData) => {
      const { data: result, error } = await supabase
        .from('categories')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kateqoriya uğurla yeniləndi');
    },
    onError: (error) => {
      console.error('Update category error:', error);
      toast.error('Kateqoriya yenilənərkən xəta baş verdi');
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kateqoriya uğurla silindi');
    },
    onError: (error) => {
      console.error('Delete category error:', error);
      toast.error('Kateqoriya silinərkən xəta baş verdi');
    }
  });

  return {
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
  };
};

export default useCategoryOperations;
