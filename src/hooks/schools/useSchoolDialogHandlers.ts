
import { useState, useCallback } from 'react';
import { School } from '@/types/school';
import { useSchoolDialogs } from './useSchoolDialogs';
import { useSchoolFormHandler } from './useSchoolFormHandler';
import { useSchoolOperations } from './useSchoolOperations';
import { SchoolFormData } from '@/types/ui';

export const useSchoolDialogHandlers = () => {
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  
  const {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isAdminDialogOpen,
    selectedSchool,
    selectedAdmin,
    openDeleteDialog,
    closeDeleteDialog,
    openEditDialog,
    closeEditDialog,
    openAddDialog,
    closeAddDialog,
    openAdminDialog,
    closeAdminDialog,
    handleEditDialogOpen,
    handleAdminDialogOpen,
    handleDeleteDialogOpen
  } = useSchoolDialogs();

  const schoolFormHandler = useSchoolFormHandler();
  const {
    formData,
    currentTab,
    setCurrentTab,
    setFormDataFromSchool,
    handleFormChange,
    resetForm,
    validateForm
  } = schoolFormHandler;

  const onSuccess = useCallback(() => {
    setIsOperationComplete(true);
  }, []);

  const onCloseDialog = useCallback((type: 'add' | 'edit' | 'delete' | 'admin') => {
    if (type === 'add') closeAddDialog();
    if (type === 'edit') closeEditDialog();
    if (type === 'delete') closeDeleteDialog();
    if (type === 'admin') closeAdminDialog();
  }, [closeAddDialog, closeEditDialog, closeDeleteDialog, closeAdminDialog]);

  const schoolOperations = useSchoolOperations(onSuccess);
  const {
    createSchool,
    updateSchool,
    deleteSchool,
    assignAdmin,
    resetPassword
  } = schoolOperations;

  const handleAddDialogOpen = useCallback(() => {
    resetForm();
    openAddDialog();
  }, [resetForm, openAddDialog]);

  const handleAddSubmit = useCallback(async (data?: SchoolFormData) => {
    if (!validateForm()) return;
    const schoolData = data || formData;
    await createSchool({
      name: schoolData.name,
      address: schoolData.address,
      phone: schoolData.phone,
      email: schoolData.email,
      region_id: schoolData.region_id,
      sector_id: schoolData.sector_id,
      principal_name: schoolData.principal_name,
      status: schoolData.status || 'active',
      logo: schoolData.logo
    });
  }, [formData, validateForm, createSchool]);

  const handleEditSubmit = useCallback(async () => {
    if (!validateForm() || !selectedSchool) return;
    await updateSchool(selectedSchool.id, formData);
  }, [formData, selectedSchool, validateForm, updateSchool]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSchool) return;
    await deleteSchool(selectedSchool.id);
  }, [selectedSchool, deleteSchool]);

  const handleAdminUpdate = useCallback(async (data?: any) => {
    if (!selectedSchool) return;
    await assignAdmin(selectedSchool.id, data);
  }, [selectedSchool, assignAdmin]);

  const handleResetPassword = useCallback(async (newPassword: string) => {
    if (!selectedAdmin) return;
    await resetPassword(selectedAdmin.id, newPassword);
  }, [selectedAdmin, resetPassword]);

  return {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isAdminDialogOpen,
    selectedSchool,
    selectedAdmin,
    isOperationComplete,
    openDeleteDialog,
    closeDeleteDialog,
    closeEditDialog,
    openAddDialog,
    closeAddDialog,
    openAdminDialog,
    closeAdminDialog,
    handleAddDialogOpen,
    handleEditDialogOpen,
    handleDeleteDialogOpen,
    handleAdminDialogOpen,
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
    handleAdminUpdate,
    handleResetPassword,
    formData,
    currentTab,
    setCurrentTab,
    handleFormChange,
    setIsOperationComplete
  };
};
