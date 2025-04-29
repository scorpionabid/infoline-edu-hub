
import { useOptimizedUserList } from './useOptimizedUserList';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useUserOperations = () => {
  const { t } = useLanguage();
  const { refetch } = useOptimizedUserList();
  const queryClient = useQueryClient();

  const deleteUser = async (userId: string) => {
    if (!userId) return false;
    
    try {
      console.log('Deleting user with ID:', userId);
      let isPartiallyDeleted = false;
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (roleError) {
        console.error('Error deleting from user_roles:', roleError);
      } else {
        console.log('Successfully deleted from user_roles');
        isPartiallyDeleted = true;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error deleting from profiles:', profileError);
      } else {
        console.log('Successfully deleted from profiles');
        isPartiallyDeleted = true;
      }
      
      try {
        console.log('Attempting to delete user from auth via Edge Function...');
        const { data, error: authError } = await supabase.functions.invoke('delete-user', {
          body: { user_id: userId }
        });
        
        if (authError) {
          console.error('Error deleting from auth via Edge Function:', authError);
        } else {
          console.log('Successfully deleted from auth via Edge Function');
        }
      } catch (authErr) {
        console.error('Exception during auth deletion via Edge Function:', authErr);
      }
      
      // Bütün user sorğularının keşini təmizlə
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
      
      if (isPartiallyDeleted) {
        toast.success(t('userDeletedSuccessfully'));
        return true;
      } else {
        toast.error(t('errorDeletingUser'));
        return false;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('errorDeletingUser'));
      return false;
    }
  };

  const assignSchoolAdmin = async (userId: string, schoolId: string, regionId: string, sectorId: string) => {
    try {
      const { data, error } = await supabase.rpc('assign_school_admin_role', {
        p_user_id: userId,
        p_school_id: schoolId,
        p_region_id: regionId,
        p_sector_id: sectorId
      });
      
      if (error) {
        console.error('Error assigning school admin:', error);
        toast.error(t('errorAssigningSchoolAdmin'));
        return false;
      }
      
      // Bütün user sorğularının keşini təmizlə
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
      
      toast.success(t('schoolAdminAssigned'));
      return true;
    } catch (err) {
      console.error('Error assigning school admin:', err);
      toast.error(t('errorAssigningSchoolAdmin'));
      return false;
    }
  };

  return {
    deleteUser,
    assignSchoolAdmin,
    refreshUsers: refetch
  };
};
