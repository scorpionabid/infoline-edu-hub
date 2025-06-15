
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType } from '@/types/column';

export const useColumnQuery = (categoryId?: string) => {
  const queryClient = useQueryClient();

  const { data: columns = [], isLoading, error } = useQuery({
    queryKey: ['columns', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index');

      if (error) throw error;

      // Transform data to match Column interface
      return (data || []).map(col => ({
        ...col,
        type: col.type as ColumnType,
        status: (col.status === 'active' || col.status === 'inactive') 
          ? col.status as 'active' | 'inactive'
          : 'active' as 'active' | 'inactive'
      })) as Column[];
    },
    enabled: !!categoryId
  });

  const createColumnMutation = useMutation({
    mutationFn: async (columnData: Omit<Column, 'id'>) => {
      const { data, error } = await supabase
        .from('columns')
        .insert([{
          ...columnData,
          name: columnData.name,
          type: columnData.type
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
    }
  });

  const updateColumnMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Column> }) => {
      const { data: result, error } = await supabase
        .from('columns')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
    }
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', categoryId] });
    }
  });

  return {
    columns,
    isLoading,
    error,
    createColumn: createColumnMutation.mutate,
    updateColumn: updateColumnMutation.mutate,
    deleteColumn: deleteColumnMutation.mutate,
    isCreating: createColumnMutation.isPending,
    isUpdating: updateColumnMutation.isPending,
    isDeleting: deleteColumnMutation.isPending
  };
};
