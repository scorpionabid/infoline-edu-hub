
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

export interface UseUserListReturn {
  selectedUser: FullUserData | null;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isDetailsDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsDetailsDialogOpen: (open: boolean) => void;
  setSelectedUser: (user: FullUserData | null) => void;
  handleEditUser: (user: FullUserData) => void;
  handleDeleteUser: (user: FullUserData) => void;
  handleDeleteUserConfirm: () => Promise<void>;
}

export const useUserList = (): UseUserListReturn => {
  const [selectedUser, setSelectedUser] = useState<FullUserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleEditUser = (user: FullUserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: FullUserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return {
    selectedUser,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isDetailsDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailsDialogOpen,
    setSelectedUser,
    handleEditUser,
    handleDeleteUser,
    handleDeleteUserConfirm
  };
};
