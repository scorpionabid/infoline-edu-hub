
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/user';
import { toast } from 'sonner';

export const useUserOperations = () => {
  const queryClient = useQueryClient();

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('İstifadəçi silindi');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error('İstifadəçi silinərkən xəta baş verdi');
      console.error(error);
    }
  });

  const updateUser = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: Partial<UserData> }) => {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('İstifadəçi yeniləndi');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error('İstifadəçi yenilənərkən xəta baş verdi');
      console.error(error);
    }
  });

  return {
    deleteUser: deleteUser.mutate,
    updateUser: updateUser.mutate,
    isDeleting: deleteUser.isPending,
    isUpdating: updateUser.isPending
  };
};
