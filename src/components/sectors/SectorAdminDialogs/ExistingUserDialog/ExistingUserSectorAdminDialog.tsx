
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sector } from '@/types/supabase';
import { useExistingUserForm } from './hooks/useExistingUserForm';
import { DialogContent as SectorAdminDialogContent } from './components/DialogContent';

interface ExistingUserSectorAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  sector: Sector | null;
  onSuccess?: () => void;
  isEmbedded?: boolean;
}

export const ExistingUserSectorAdminDialog: React.FC<ExistingUserSectorAdminDialogProps> = ({ 
  open, 
  setOpen,
  sector,
  onSuccess,
  isEmbedded = false
}) => {
  const {
    form,
    selectedUserId,
    error,
    usersError,
    filteredUsers,
    loadingUsers,
    assigningUser,
    showExistingAdmins,
    handleUserSelect,
    handleAssignAdmin,
    handleForceRefresh,
    handleCheckboxChange,
    resetForm
  } = useExistingUserForm(sector, onSuccess, setOpen);
  
  // Dialog açıldığında formu sıfırla
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // Dialog content
  const dialogContent = (
    <SectorAdminDialogContent
      form={form}
      sector={sector}
      isEmbedded={isEmbedded}
      error={error}
      usersError={usersError}
      filteredUsers={filteredUsers}
      loadingUsers={loadingUsers}
      selectedUserId={selectedUserId}
      assigningUser={assigningUser}
      showExistingAdmins={showExistingAdmins}
      onUserSelect={handleUserSelect}
      onRefresh={handleForceRefresh}
      onCancel={() => setOpen(false)}
      onAssignAdmin={handleAssignAdmin}
      onCheckboxChange={handleCheckboxChange}
    />
  );

  if (isEmbedded) {
    return dialogContent;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
};
