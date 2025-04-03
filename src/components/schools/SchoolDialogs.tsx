
import React from 'react';
import { School } from '@/types/school';
import { DeleteDialog, AddDialog, EditDialog, AdminDialog } from './school-dialogs';

interface SchoolDialogsProps {
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isAddDialogOpen: boolean;
  isAdminDialogOpen: boolean;
  selectedSchool: School | null;
  selectedAdmin: any | null;
  closeDeleteDialog: () => void;
  closeEditDialog: () => void;
  closeAddDialog: () => void;
  closeAdminDialog: () => void;
  handleDeleteConfirm: () => void;
  handleAddSubmit: (data: Omit<School, 'id' | 'createdAt' | 'updatedAt'>) => void;
  handleEditSubmit: (data: Partial<School>) => void;
  handleAdminUpdate: (adminData: any) => void;
  handleResetPassword: (newPassword: string) => void; // Dəyişdirilib: string parametri əlavə edildi
  formData: any;
  handleFormChange: (field: string, value: any) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  filteredSectors: { id: string; name: string; regionId: string }[];
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
      {/* Məktəbi silmək üçün dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={() => closeDeleteDialog()}
        school={selectedSchool}
        onDelete={handleDeleteConfirm}
      />
      
      {/* Məktəbi redaktə etmək üçün dialog */}
      <EditDialog
        open={isEditDialogOpen}
        onOpenChange={() => closeEditDialog()}
        school={selectedSchool}
        onSubmit={handleEditSubmit}
        formData={formData}
        onChange={handleFormChange}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        filteredSectors={filteredSectors}
      />
      
      {/* Yeni məktəb əlavə etmək üçün dialog */}
      <AddDialog
        open={isAddDialogOpen}
        onOpenChange={() => closeAddDialog()}
        onSubmit={handleAddSubmit}
        formData={formData}
        onChange={handleFormChange}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        filteredSectors={filteredSectors}
      />
      
      {/* Məktəb admini idarə etmək üçün dialog */}
      <AdminDialog
        open={isAdminDialogOpen}
        onOpenChange={() => closeAdminDialog()}
        school={selectedSchool}
        admin={selectedAdmin}
        onSubmit={handleAdminUpdate}
        onResetPassword={handleResetPassword}
      />
    </>
  );
};

export default SchoolDialogs;
