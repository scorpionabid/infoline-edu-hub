
import { useState } from 'react';
import { FullUserData } from '@/types/supabase';

export const useUserDialogs = () => {
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

  const handleViewUserDetails = (user: FullUserData) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };

  const handleEditUserConfirm = async (userData: FullUserData) => {
    // Implementation will be added when needed
    console.log('Updating user:', userData);
    return true;
  };

  const handleDeleteUserConfirm = async (userId: string) => {
    // Implementation will be added when needed
    console.log('Deleting user:', userId);
    return true;
  };

  return {
    selectedUser,
    setSelectedUser,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isDetailsDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailsDialogOpen,
    handleEditUser,
    handleDeleteUser,
    handleViewUserDetails,
    handleEditUserConfirm,
    // handleDeleteUserConfirm
  };
};

export default useUserDialogs;
