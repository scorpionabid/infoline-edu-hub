import React from 'react';
import { 
  DeleteDialog, 
  EditDialog, 
  AddDialog, 
  AdminDialog 
} from './school-dialogs';
import { School } from '@/types/school';
import { SchoolFormData } from '@/types/school-form';

interface SchoolDialogsProps {
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isAddDialogOpen: boolean;
  isAdminDialogOpen: boolean;
  selectedSchool: School | null;
  selectedAdmin: School | null;
  closeDeleteDialog: () => void;
  closeEditDialog: () => void;
  closeAddDialog: () => void;
  closeAdminDialog: () => void;
  handleDeleteConfirm: () => void;
  handleAddSubmit: () => void;
  handleEditSubmit: () => void;
  handleAdminUpdate: () => void;
  handleResetPassword: (newPassword: string) => void;
  formData: SchoolFormData;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  filteredSectors: Array<{ id: string; name: string; regionId: string }>;
}

const SchoolDialogs: React.FC<SchoolDialogsProps> = ({
  isDeleteDialogOpen,
  isEditDialogOpen,
  isAddDialogOpen,
  isAdminDialogOpen,
  selectedSchool,
  selectedAdmin,
  closeDeleteDialog,
  closeEditDialog,
  closeAddDialog,
  closeAdminDialog,
  handleDeleteConfirm,
  handleAddSubmit,
  handleEditSubmit,
  handleAdminUpdate,
  handleResetPassword,
  formData,
  handleFormChange,
  currentTab,
  setCurrentTab,
  filteredSectors
}) => {
  return (
    <>
      <DeleteDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={closeDeleteDialog} 
        onConfirm={handleDeleteConfirm} 
      />
      
      <AddDialog 
        isOpen={isAddDialogOpen} 
        onClose={closeAddDialog} 
        onSubmit={handleAddSubmit} 
        formData={formData} 
        handleFormChange={handleFormChange} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        filteredSectors={filteredSectors}
      />
      
      <EditDialog 
        isOpen={isEditDialogOpen} 
        onClose={closeEditDialog} 
        onSubmit={handleEditSubmit} 
        formData={formData} 
        handleFormChange={handleFormChange} 
        filteredSectors={filteredSectors}
      />
      
      <AdminDialog 
        isOpen={isAdminDialogOpen} 
        onClose={closeAdminDialog} 
        onUpdate={handleAdminUpdate} 
        onResetPassword={handleResetPassword} 
        selectedAdmin={selectedAdmin} 
      />
    </>
  );
};

export const AdminDialogWrapper = ({ 
  selectedAdmin, 
  isOpen, 
  onClose, 
  onUpdate, 
  onResetPassword 
}: { 
  selectedAdmin: School; 
  isOpen: boolean; 
  onClose: () => void; 
  onUpdate: () => void;
  onResetPassword: (newPassword: string) => void; 
}) => {
  return (
    <AdminDialog 
      school={selectedAdmin}
      open={isOpen} 
      onClose={onClose}
      onRefresh={onUpdate}
    />
  );
};

export default SchoolDialogs;
