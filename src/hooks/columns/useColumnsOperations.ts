
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreateColumnData {
  name: string;
  type: string;
  category_id: string;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  options?: any;
  validation?: any;
}

export interface UpdateColumnData {
  name?: string;
  type?: string;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  options?: any;
  validation?: any;
}

export const useColumnsOperations = () => {
  const queryClient = useQueryClient();

  const { data: columns = [], isLoading } = useQuery({
    queryKey: ['columns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('status', 'active')
        .order('order_index');
      
      if (error) throw error;
      return data;
    }
  });

  const createColumn = useMutation({
    mutationFn: async (columnData: CreateColumnData) => {
      const { data, error } = await supabase
        .from('columns')
        .insert([columnData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Sütun yaradıldı');
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
    onError: (error: any) => {
      toast.error('Sütun yaradılarkən xəta baş verdi');
      console.error(error);
    }
  });

  const updateColumn = useMutation({
    mutationFn: async (data: UpdateColumnData & { id: string }) => {
      const { id, ...updates } = data;
      const { data: result, error } = await supabase
        .from('columns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Sütun yeniləndi');
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
    onError: (error: any) => {
      toast.error('Sütun yenilənərkən xəta baş verdi');
      console.error(error);
    }
  });

  const deleteColumn = useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'deleted' })
        .eq('id', columnId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Sütun silindi');
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
    onError: (error: any) => {
      toast.error('Sütun silinərkən xəta baş verdi');
      console.error(error);
    }
  });

  return {
    columns,
    isLoading,
    createColumn: createColumn.mutate,
    updateColumn: updateColumn.mutate,
    deleteColumn: deleteColumn.mutate,
    isCreating: createColumn.isPending,
    isUpdating: updateColumn.isPending,
    isDeleting: deleteColumn.isPending,
    createError: createColumn.error,
    updateError: updateColumn.error,
    deleteError: deleteColumn.error,
    isReordering: false
  };
};
