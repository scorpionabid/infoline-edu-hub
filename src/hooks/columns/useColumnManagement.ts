
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useColumnManagement = () => {
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'archived' })
        .eq('id', columnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun arxivləşdirildi');
    },
    onError: (error) => {
      console.error('Error archiving column:', error);
      toast.error('Sütun arxivləşdirilməsində xəta');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase
        .from('columns')
        .update({ status: 'active' })
        .eq('id', columnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Sütun bərpa edildi');
    },
    onError: (error) => {
      console.error('Error restoring column:', error);
      toast.error('Sütun bərpasında xəta');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (columnId: string, permanent: boolean = false) => {
      if (permanent) {
        const { error } = await supabase
          .from('columns')
          .delete()
          .eq('id', columnId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('columns')
          .update({ status: 'archived' })
          .eq('id', columnId);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      const [, permanent] = Array.isArray(variables) ? variables : [variables, false];
      toast.success(permanent ? 'Sütun həmişəlik silindi' : 'Sütun silindi');
    },
    onError: (error) => {
      console.error('Error deleting column:', error);
      toast.error('Sütun silinməsində xəta');
    }
  });

  return {
    archiveColumn: archiveMutation.mutate,
    restoreColumn: restoreMutation.mutate,
    deleteColumn: deleteMutation.mutate,
    isArchiving: archiveMutation.isPending,
    isRestoring: restoreMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
