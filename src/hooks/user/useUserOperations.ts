
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useUserOperations = (onOperationComplete: () => void) => {
  const { t } = useLanguage();
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

  const handleUpdateUserConfirm = useCallback(async (updatedUserData: FullUserData) => {
    if (!selectedUser) return;
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updatedUserData.full_name,
          phone: updatedUserData.phone,
          position: updatedUserData.position,
          language: updatedUserData.language,
          avatar: updatedUserData.avatar,
          status: updatedUserData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);
      
      if (profileError) throw profileError;
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          role: updatedUserData.role as any,
          region_id: updatedUserData.region_id,
          sector_id: updatedUserData.sector_id,
          school_id: updatedUserData.school_id,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedUser.id);
      
      if (roleError) throw roleError;
      
      toast.success(t('userUpdated'));
      setIsEditDialogOpen(false);
      onOperationComplete();
    } catch (err) {
      console.error('İstifadəçi yeniləmə xətası:', err);
      toast.error('İstifadəçi məlumatları yenilənərkən xəta baş verdi');
    }
  }, [selectedUser, t, onOperationComplete]);

  const handleDeleteUserConfirm = useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      toast.success(t('userDeleted'));
      setIsDeleteDialogOpen(false);
      onOperationComplete();
    } catch (err) {
      console.error('İstifadəçi silmə xətası:', err);
      toast.error('İstifadəçi silinərkən xəta baş verdi');
    }
  }, [selectedUser, t, onOperationComplete]);

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
