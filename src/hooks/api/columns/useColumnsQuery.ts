
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnFormValues, ColumnType, ColumnOption } from '@/types/column';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transformRawColumnData } from '@/utils/columnOptionsParser';

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
      
      // Transform data using standardized parser
      console.log('📊 useColumnsQuery - Raw data from Supabase:', data);
      
      const transformedColumns = (data || []).map(item => {
        const transformed = {
          id: item.id,
          name: item.name,
          type: item.type as ColumnType,
          category_id: item.category_id,
          placeholder: item.placeholder,
          help_text: item.help_text,
          is_required: item.is_required,
          default_value: item.default_value,
          order_index: item.order_index,
          status: item.status as 'active' | 'inactive',
          created_at: item.created_at,
          updated_at: item.updated_at,
          ...transformRawColumnData(item)
        };
        
        console.log(`📝 Transformed column "${item.name}":`, {
          type: item.type,
          rawOptions: item.options,
          parsedOptions: transformed.options,
          optionsCount: transformed.options?.length || 0
        });
        
        return transformed;
      });
      
      console.log('✅ useColumnsQuery - Final transformed columns:', transformedColumns);
      return transformedColumns;
    },
    enabled: !!categoryId
  });
};

export const useColumnMutation = () => {
  const queryClient = useQueryClient();

  const createColumn = async (column: ColumnFormValues): Promise<Column> => {
    const columnData = {
      ...column,
      options: column.options ? JSON.stringify(column.options) : null,
      validation: column.validation ? JSON.stringify(column.validation) : null,
    };

    const { data, error } = await supabase
      .from('columns')
      .insert([columnData])
      .select()
      .single();

    if (error) throw error;
    return data as Column;
  };

  const updateColumn = async (column: Column): Promise<Column> => {
    const columnData = {
      ...column,
      options: column.options ? JSON.stringify(column.options) : null,
      validation: column.validation ? JSON.stringify(column.validation) : null,
    };

    const { data, error } = await supabase
      .from('columns')
      .update(columnData)
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
