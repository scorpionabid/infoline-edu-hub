
import React from 'react';
import { School } from '@/types/school';
import { DeleteSchoolDialog } from './DeleteSchoolDialog';
import { SchoolAdminDialog } from './SchoolAdminDialog';

interface SchoolDialogsContainerProps {
  // Delete dialog
  isDeleteDialogOpen: boolean;
  onDeleteDialogClose: () => void;
  onDeleteConfirm: () => Promise<void>;
  schoolToDelete: School | null;
  isDeleting: boolean;
  
  // Admin dialog
  isAdminDialogOpen: boolean;
  onAdminDialogClose: () => void;
  schoolForAdmin: School | null;
  onAdminSubmit: (adminData: any) => Promise<void>;
  isSubmittingAdmin: boolean;
}

export const SchoolDialogsContainer: React.FC<SchoolDialogsContainerProps> = ({
  isDeleteDialogOpen,
  onDeleteDialogClose,
  onDeleteConfirm,
  schoolToDelete,
  isDeleting,
  isAdminDialogOpen,
  onAdminDialogClose,
  schoolForAdmin,
  onAdminSubmit,
  isSubmittingAdmin
}) => {
  return (
    <>
      {schoolToDelete && (
        <DeleteSchoolDialog
          isOpen={isDeleteDialogOpen}
          onClose={onDeleteDialogClose}
          onConfirm={onDeleteConfirm}
          school={schoolToDelete}
          isSubmitting={isDeleting}
        />
      )}
      
      {schoolForAdmin && (
        <SchoolAdminDialog
          isOpen={isAdminDialogOpen}
          onClose={onAdminDialogClose}
          school={schoolForAdmin}
          onSubmit={onAdminSubmit}
          isSubmitting={isSubmittingAdmin}
        />
      )}
    </>
  );
};
