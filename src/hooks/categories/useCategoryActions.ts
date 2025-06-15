
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCategoryOperations } from './useCategoryOperations';

export const useCategoryActions = () => {
  const queryClient = useQueryClient();
  const { createCategory, updateCategory } = useCategoryOperations();

  const toggleCategoryStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      const statusText = data.status === 'active' ? 'aktivləşdirildi' : 'deaktivləşdirildi';
      toast.success(`Kateqoriya ${statusText}`);
    },
    onError: (error) => {
      console.error('Toggle category status error:', error);
      toast.error('Status dəyişdirilərkən xəta baş verdi');
    }
  });

  const duplicateCategory = useMutation({
    mutationFn: async (categoryId: string) => {
      const { data: original, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: `${original.name} (kopya)`,
          description: original.description,
          assignment: original.assignment,
          order_index: (original.order_index || 0) + 1,
          priority: original.priority,
          deadline: original.deadline,
          status: 'active',
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
      toast.success('Kateqoriya uğurla kopyalandı');
    },
    onError: (error) => {
      console.error('Duplicate category error:', error);
      toast.error('Kateqoriya kopyalanarkən xəta baş verdi');
    }
  });

  return {
    toggleStatus: toggleCategoryStatus.mutate,
    duplicate: duplicateCategory.mutate,
    updateCategory,
    createCategory,
    isToggling: toggleCategoryStatus.isPending,
    isDuplicating: duplicateCategory.isPending,
    isLoading: toggleCategoryStatus.isPending || duplicateCategory.isPending,
  };
};

export default useCategoryActions;
