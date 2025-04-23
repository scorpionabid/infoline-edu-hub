import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguageSafe } from '@/context/LanguageContext';

export const useUserOperations = (onComplete: () => void) => {
  const { t } = useLanguageSafe();
  const [selectedUser, setSelectedUser] = useState<FullUserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleEditUser = useCallback((user: FullUserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteUser = useCallback((user: FullUserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((user: FullUserData) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleUpdateUserConfirm = useCallback(async (updatedUser: FullUserData) => {
    try {
      console.log('Updating user:', updatedUser);
      
      // Profile məlumatlarını yeniləyirik
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updatedUser.full_name,
          phone: updatedUser.phone,
          position: updatedUser.position,
          language: updatedUser.language,
          status: updatedUser.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedUser.id);
      
      if (profileError) throw profileError;
      
      // Rol məlumatlarını yeniləyirik
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          role: updatedUser.role,
          region_id: updatedUser.region_id,
          sector_id: updatedUser.sector_id,
          school_id: updatedUser.school_id,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', updatedUser.id);
      
      if (roleError) throw roleError;
      
      toast.success(t('userUpdated'));
      setIsEditDialogOpen(false);
      onComplete();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(t('errorUpdatingUser'), {
        description: error.message
      });
    }
  }, [t, onComplete]);

  const handleDeleteUserConfirm = useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      console.log('Deleting user:', selectedUser.id);
      let isPartiallyDeleted = false;
      
      // İlk olaraq user_roles cədvəlindən silirik
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);
      
      if (roleError) {
        console.error('Error deleting from user_roles:', roleError);
        // Xəta olsa da davam edirik, çünki istifadəçi cədvəldə olmaya bilər
      } else {
        console.log('Successfully deleted from user_roles');
        isPartiallyDeleted = true;
      }
      
      // Sonra profiles cədvəlindən silirik
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);
      
      if (profileError) {
        console.error('Error deleting from profiles:', profileError);
        // Xəta olsa da davam edirik, çünki istifadəçi cədvəldə olmaya bilər
      } else {
        console.log('Successfully deleted from profiles');
        isPartiallyDeleted = true;
      }
      
      // Edge Function vasitəsilə Supabase Auth-dan istifadəçini silirik
      let authDeleteSuccess = false;
      try {
        console.log('Attempting to delete user from auth via Edge Function...');
        const { data, error: authError } = await supabase.functions.invoke('delete-user', {
          body: { user_id: selectedUser.id }
        });
        
        if (authError) {
          console.error('Error deleting from auth via Edge Function:', authError);
        } else {
          console.log('Successfully deleted from auth via Edge Function');
          authDeleteSuccess = true;
        }
      } catch (authErr) {
        console.error('Exception during auth deletion via Edge Function:', authErr);
        // Edge Function xətası olsa da davam edirik
      }
      
      if (isPartiallyDeleted) {
        if (authDeleteSuccess) {
          toast.success(t('userDeletedCompletely'));
        } else {
          toast.success(t('userDeletedPartially'), {
            description: t('userDeletedPartiallyDesc')
          });
        }
        setIsDeleteDialogOpen(false);
        onComplete();
      } else {
        toast.error(t('errorDeletingUser'));
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(t('errorDeletingUser'), {
        description: error.message
      });
    }
  }, [selectedUser, t, onComplete, supabase, setIsDeleteDialogOpen]);

  return {
    selectedUser,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isDetailsDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailsDialogOpen,
    handleEditUser,
    handleDeleteUser,
    handleViewDetails,
    handleUpdateUserConfirm,
    handleDeleteUserConfirm
  };
};
