
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnFormData } from '@/types/column';
import { toast } from 'sonner';

export const useColumnMutations = () => {
  const queryClient = useQueryClient();

  const createColumn = useMutation({
    mutationFn: async (data: ColumnFormData): Promise<Column> => {
      const { data: result, error } = await supabase
        .from('columns')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['columns']
      });
      queryClient.invalidateQueries({ 
        queryKey: ['active-columns']
      });
      toast.success('Sütun uğurla yaradıldı');
    },
    onError: (error) => {
      console.error('Error creating column:', error);
      toast.error('Sütun yaradılarkən xəta baş verdi');
    }
  });

  const updateColumn = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ColumnFormData> }): Promise<Column> => {
      const { data: result, error } = await supabase
        .from('columns')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['columns']
      });
      queryClient.invalidateQueries({ 
        queryKey: ['column', data.id]
      });
      toast.success('Sütun uğurla yeniləndi');
    },
    onError: (error) => {
      console.error('Error updating column:', error);
      toast.error('Sütun yenilənərkən xəta baş verdi');
    }
  });

  const deleteColumn = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['columns']
      });
      queryClient.invalidateQueries({ 
        queryKey: ['active-columns']
      });
      toast.success('Sütun arxivləndi');
    },
    onError: (error) => {
      console.error('Error archiving column:', error);
      toast.error('Sütun arxivlənərkən xəta baş verdi');
    }
  });

  return {
    createColumn,
    updateColumn,
    deleteColumn
  };
};
