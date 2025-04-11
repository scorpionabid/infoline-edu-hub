import { useState, useCallback } from 'react';
import { School } from '@/data/schoolsData';
import { School as SupabaseSchool } from '@/types/supabase';
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
  } = useSchoolOperations(onSuccess, onCloseDialog);

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
    
    // School tipini SupabaseSchool tipinə çevirmək
    const schoolForEdit = selectedSchool ? {
      id: selectedSchool.id,
      name: selectedSchool.name,
      principal_name: selectedSchool.principal_name,
      address: selectedSchool.address,
      region_id: selectedSchool.region_id,
      sector_id: selectedSchool.sector_id,
      phone: selectedSchool.phone,
      email: selectedSchool.email,
      student_count: selectedSchool.student_count,
      teacher_count: selectedSchool.teacher_count,
      status: selectedSchool.status as 'active' | 'inactive',
      language: selectedSchool.language,
      type: selectedSchool.type,
      admin_email: selectedSchool.admin_email
    } : null;
    
    await operationEditSubmit(formData, schoolForEdit);
  }, [formData, selectedSchool, validateForm, operationEditSubmit]);

  const handleDeleteConfirm = useCallback(async () => {
    // School tipini SupabaseSchool tipinə çevirmək
    const schoolForDelete = selectedSchool ? {
      id: selectedSchool.id,
      name: selectedSchool.name,
      principal_name: selectedSchool.principal_name,
      address: selectedSchool.address,
      region_id: selectedSchool.region_id,
      sector_id: selectedSchool.sector_id,
      phone: selectedSchool.phone,
      email: selectedSchool.email,
      student_count: selectedSchool.student_count,
      teacher_count: selectedSchool.teacher_count,
      status: selectedSchool.status as 'active' | 'inactive',
      language: selectedSchool.language,
      type: selectedSchool.type,
      admin_email: selectedSchool.admin_email
    } : null;
    
    await operationDeleteConfirm(schoolForDelete);
  }, [selectedSchool, operationDeleteConfirm]);

  const handleAdminUpdate = useCallback(() => {
    operationAdminUpdate();
  }, [operationAdminUpdate]);

  const handleResetPassword = useCallback((newPassword: string) => {
    operationResetPassword(newPassword);
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
