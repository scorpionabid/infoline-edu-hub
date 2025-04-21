import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FullUserData } from '@/types/user';

export const useUserOperations = (onOperationComplete: () => void) => {
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

  const handleUpdateUserConfirm = useCallback(async () => {
    if (!selectedUser) return;

    try {
      // İstifadəçi profilini yenilə
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: selectedUser.full_name,
          email: selectedUser.email,
          phone: selectedUser.phone,
          position: selectedUser.position,
          language: selectedUser.language,
          status: selectedUser.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);
      
      if (profileError) throw profileError;
      
      // İstifadəçi rolunu yenilə
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          role: selectedUser.role,
          region_id: selectedUser.region_id || selectedUser.regionId,
          sector_id: selectedUser.sector_id || selectedUser.sectorId,
          school_id: selectedUser.school_id || selectedUser.schoolId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedUser.id);
      
      if (roleError) throw roleError;
      
      // İşləm tamamlandı
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      onOperationComplete();
      return true;
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('İstifadəçi yenilənərkən xəta baş verdi');
      return false;
    }
  }, [selectedUser, onOperationComplete]);

  const handleDeleteUserConfirm = useCallback(async () => {
    if (!selectedUser) return;

    try {
      // İstifadəçi rolunu sil
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);
      
      if (roleError) throw roleError;
      
      // İstifadəçi profilini sil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;
      
      // Auth istifadəçisini sil (bu edge function ilə edilməlidir)
      const { error: authError } = await supabase.functions.invoke('delete-user', {
        body: { userId: selectedUser.id }
      });
      
      if (authError) {
        console.warn('Auth user could not be deleted:', authError);
        // Burada tam xəta atmırıq, çünki profil və rol silindiyi üçün əsas işləm tamamlanmış sayılır
      }

      // İşləm tamamlandı
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      onOperationComplete();
      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('İstifadəçi silinərkən xəta baş verdi');
      return false;
    }
  }, [selectedUser, onOperationComplete]);

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
