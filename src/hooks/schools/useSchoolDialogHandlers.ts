
import { useState, useCallback } from 'react';
import { School } from '@/types/school';
import { useSchoolDialogs } from './useSchoolDialogs';
import { useSchoolFormHandler } from './useSchoolFormHandler';
import { useSchoolOperations } from './useSchoolOperations';

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

  const {
    formData,
    currentTab,
    setCurrentTab,
    setFormDataFromSchool,
    handleFormChange,
    resetForm,
    validateForm
  } = useSchoolFormHandler();

  const onSuccess = useCallback(() => {
    setIsOperationComplete(true);
  }, []);

  const onCloseDialog = useCallback((type: 'add' | 'edit' | 'delete' | 'admin') => {
    if (type === 'add') closeAddDialog();
    if (type === 'edit') closeEditDialog();
    if (type === 'delete') closeDeleteDialog();
    if (type === 'admin') closeAdminDialog();
  }, [closeAddDialog, closeEditDialog, closeDeleteDialog, closeAdminDialog]);

  const {
    handleAddSubmit: operationAddSubmit,
    handleEditSubmit: operationEditSubmit,
    handleDeleteConfirm: operationDeleteConfirm,
    handleAdminUpdate: operationAdminUpdate,
    handleResetPassword: operationResetPassword
  } = useSchoolOperations(onSuccess);

  const handleAddDialogOpen = useCallback(() => {
    resetForm();
    openAddDialog();
  }, [resetForm, openAddDialog]);

  const handleAddSubmit = useCallback(async () => {
    if (!validateForm()) return;
    await operationAddSubmit(formData);
  }, [formData, validateForm, operationAddSubmit]);

  const handleEditSubmit = useCallback(async () => {
    if (!validateForm()) return;
    await operationEditSubmit(formData, selectedSchool);
  }, [formData, selectedSchool, validateForm, operationEditSubmit]);

  const handleDeleteConfirm = useCallback(async () => {
    await operationDeleteConfirm(selectedSchool);
  }, [selectedSchool, operationDeleteConfirm]);

  const handleAdminUpdate = useCallback(async () => {
    await operationAdminUpdate();
  }, [operationAdminUpdate]);

  const handleResetPassword = useCallback(async (newPassword: string) => {
    await operationResetPassword(newPassword);
  }, [operationResetPassword]);

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
