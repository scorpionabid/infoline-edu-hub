import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnFormValues } from '@/types/column';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useColumnsQuery = (categoryId: string) => {
  return useQuery({
    queryKey: ['columns', categoryId],
    queryFn: async (): Promise<Column[]> => {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryId
  });
};

export const useColumnMutation = () => {
  const queryClient = useQueryClient();

  const createColumn = async (column: ColumnFormValues): Promise<Column> => {
    const { data, error } = await supabase
      .from('columns')
      .insert([column])
      .select()
      .single();

    if (error) throw error;
    return data as Column;
  };

  const updateColumn = async (column: Column): Promise<Column> => {
    const { data, error } = await supabase
      .from('columns')
      .update(column)
      .eq('id', column.id)
      .select()
      .single();

    if (error) throw error;
    return data as Column;
  };

  const deleteColumn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('columns')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  };

  const createMutation = useMutation({
    mutationFn: createColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
