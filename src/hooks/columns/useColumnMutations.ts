
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useColumnMutations = () => {
  const queryClient = useQueryClient();

  const duplicateColumn = useMutation({
    mutationFn: async ({ columnId }: { columnId: string }) => {
      const { data: originalColumn, error: fetchError } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();

      if (fetchError) throw fetchError;

      const duplicatedColumn = {
        ...originalColumn,
        id: undefined,
        name: `${originalColumn.name} (Kopya)`,
        created_at: undefined,
        updated_at: undefined,
      };

      const { data, error } = await supabase
        .from('columns')
        .insert([duplicatedColumn])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun uğurla kopyalandı');
    },
    onError: (error) => {
      console.error('Duplicate column error:', error);
      toast.error('Sütun kopyalama xətası');
    }
  });

  const bulkToggleStatus = useMutation({
    mutationFn: async ({ columnIds, status }: { columnIds: string[], status: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('columns')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', columnIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(`Sütunlar ${status === 'active' ? 'aktivləşdirildi' : 'deaktivləşdirildi'}`);
    },
    onError: (error) => {
      console.error('Bulk toggle status error:', error);
      toast.error('Status dəyişdirmə xətası');
    }
  });

  const moveColumnsToCategory = useMutation({
    mutationFn: async ({ columnIds, targetCategoryId }: { columnIds: string[], targetCategoryId: string }) => {
      const { data, error } = await supabase
        .from('columns')
        .update({ category_id: targetCategoryId, updated_at: new Date().toISOString() })
        .in('id', columnIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütunlar başqa kateqoriyaya köçürüldü');
    },
    onError: (error) => {
      console.error('Move columns error:', error);
      toast.error('Sütun köçürmə xətası');
    }
  });

  const bulkDelete = useMutation({
    mutationFn: async ({ columnIds }: { columnIds: string[] }) => {
      const { data, error } = await supabase
        .from('columns')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .in('id', columnIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Seçilmiş sütunlar silindi');
    },
    onError: (error) => {
      console.error('Bulk delete error:', error);
      toast.error('Toplu silmə xətası');
    }
  });

  return {
    duplicateColumn: duplicateColumn.mutate,
    bulkToggleStatus: bulkToggleStatus.mutate,
    moveColumnsToCategory: moveColumnsToCategory.mutate,
    bulkDelete: bulkDelete.mutate,
    duplicateColumnAsync: duplicateColumn.mutateAsync,
    bulkToggleStatusAsync: bulkToggleStatus.mutateAsync,
    moveColumnsToCategoryAsync: moveColumnsToCategory.mutateAsync,
    bulkDeleteAsync: bulkDelete.mutateAsync,
  };
};
