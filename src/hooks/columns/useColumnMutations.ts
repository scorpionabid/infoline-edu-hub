
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { adaptColumnToSupabase } from './useColumnAdapters';
import { toast } from 'sonner';

export const useColumnMutations = () => {
  const queryClient = useQueryClient();

  // Sütun əlavə etmək üçün mutasiya
  const addColumn = useMutation({
    mutationFn: async (column: Omit<Column, 'id' | 'created_at' | 'updated_at'>) => {
      // Supabase-ə göndərmək üçün adaptasiya et
      const supabaseColumn = adaptColumnToSupabase(column);
      
      const { data, error } = await supabase
        .from('columns')
        .insert(supabaseColumn)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla əlavə edildi');
    },
    onError: (error: any) => {
      console.error('Sütun əlavə edilərkən xəta:', error);
      toast.error(`Sütun əlavə edilərkən xəta: ${error.message}`);
    }
  });

  // Sütunu yeniləmək üçün mutasiya
  const updateColumn = useMutation({
    mutationFn: async (column: Partial<Column> & { id: string }) => {
      // Supabase-ə göndərmək üçün adaptasiya et
      const supabaseColumn = adaptColumnToSupabase(column);
      
      const { data, error } = await supabase
        .from('columns')
        .update(supabaseColumn)
        .eq('id', column.id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla yeniləndi');
    },
    onError: (error: any) => {
      console.error('Sütun yenilənərkən xəta:', error);
      toast.error(`Sütun yenilənərkən xəta: ${error.message}`);
    }
  });

  // Sütunu silmək üçün mutasiya
  const deleteColumn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla silindi');
    },
    onError: (error: any) => {
      console.error('Sütun silinərkən xəta:', error);
      toast.error(`Sütun silinərkən xəta: ${error.message}`);
    }
  });

  return {
    addColumn,
    updateColumn,
    deleteColumn
  };
};
