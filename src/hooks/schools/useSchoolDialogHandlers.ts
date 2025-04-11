import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useSchoolsOperations } from './useSchoolsOperations';
import { useSchoolForm, getInitialFormState } from '../useSchoolForm';
import { School, adaptSchoolFromSupabase } from '@/types/supabase';

export const useSchoolDialogHandlers = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  
  const { 
    formData, 
    currentTab, 
    setCurrentTab,
    setFormDataFromSchool, 
    handleFormChange,
    resetForm,
    validateForm
  } = useSchoolForm();
  
  const {
    addSchool,
    updateSchool,
    deleteSchool,
    assignSchoolAdmin,
    resetSchoolAdminPassword
  } = useSchoolsOperations();

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedSchool(null);
  }, []);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedSchool(null);
    resetForm();
  }, [resetForm]);

  const closeAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    resetForm();
  }, [resetForm]);

  const closeAdminDialog = useCallback(() => {
    setIsAdminDialogOpen(false);
    setSelectedSchool(null);
    setSelectedAdmin(null);
  }, []);

  const handleAddDialogOpen = useCallback(() => {
    resetForm();
    setIsAddDialogOpen(true);
  }, [resetForm]);

  const handleEditDialogOpen = useCallback((school: School) => {
    setSelectedSchool(school);
    setFormDataFromSchool({
      id: school.id,
      name: school.name,
      principalName: school.principalName || school.principal_name || '',
      address: school.address || '',
      regionId: school.regionId || school.region_id || '',
      sectorId: school.sectorId || school.sector_id || '',
      phone: school.phone || '',
      email: school.email || '',
      studentCount: school.studentCount || school.student_count || 0,
      teacherCount: school.teacherCount || school.teacher_count || 0,
      status: school.status || 'active',
      type: school.type || '',
      language: school.language || '',
      adminEmail: school.adminEmail || school.admin_email || '',
      createdAt: school.createdAt || school.created_at,
      updatedAt: school.updatedAt || school.updated_at
    });
    setIsEditDialogOpen(true);
  }, [setFormDataFromSchool]);

  const handleDeleteDialogOpen = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleAdminDialogOpen = useCallback((school: School) => {
    setSelectedSchool({
      id: school.id,
      name: school.name,
      principalName: school.principalName || school.principal_name || '',
      address: school.address || '',
      regionId: school.regionId || school.region_id || '',
      sectorId: school.sectorId || school.sector_id || '',
      phone: school.phone || '',
      email: school.email || '',
      studentCount: school.studentCount || school.student_count || 0,
      teacherCount: school.teacherCount || school.teacher_count || 0,
      status: school.status || 'active',
      type: school.type || '',
      language: school.language || '',
      adminEmail: school.adminEmail || school.admin_email || '',
      createdAt: school.createdAt || school.created_at,
      updatedAt: school.updatedAt || school.updated_at
    });
    setIsAdminDialogOpen(true);
  }, []);

  const handleAddSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      await addSchool(formData);
      toast.success('Məktəb uğurla əlavə edildi');
      closeAddDialog();
    } catch (error) {
      console.error('Məktəb əlavə edilərkən xəta:', error);
      toast.error('Məktəb əlavə edilərkən xəta baş verdi');
    }
  }, [formData, validateForm, addSchool, closeAddDialog]);

  const handleEditSubmit = useCallback(async () => {
    if (!validateForm() || !selectedSchool) return;
    
    try {
      await updateSchool(selectedSchool.id, formData);
      toast.success('Məktəb məlumatları uğurla yeniləndi');
      closeEditDialog();
    } catch (error) {
      console.error('Məktəb yenilənərkən xəta:', error);
      toast.error('Məktəb yenilənərkən xəta baş verdi');
    }
  }, [formData, selectedSchool, validateForm, updateSchool, closeEditDialog]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSchool) return;
    
    try {
      await deleteSchool(selectedSchool.id);
      toast.success('Məktəb uğurla silindi');
      closeDeleteDialog();
    } catch (error) {
      console.error('Məktəb silinərkən xəta:', error);
      toast.error('Məktəb silinərkən xəta baş verdi');
    }
  }, [selectedSchool, deleteSchool, closeDeleteDialog]);

  const handleAdminUpdate = useCallback(() => {
    if (!selectedSchool) return;
    
    try {
      toast.success('Admin uğurla təyin edildi');
      closeAdminDialog();
    } catch (error) {
      console.error('Admin təyin edilərkən xəta:', error);
      toast.error('Admin təyin edilərkən xəta baş verdi');
    }
  }, [selectedSchool, closeAdminDialog]);

  const handleResetPassword = useCallback(async (userId: string, newPassword: string) => {
    try {
      await resetSchoolAdminPassword(userId, newPassword);
      toast.success('Şifrə uğurla sıfırlandı');
    } catch (error) {
      console.error('Şifrə sıfırlanarkən xəta:', error);
      toast.error('Şifrə sıfırlanarkən xəta baş verdi');
    }
  }, [resetSchoolAdminPassword]);

  return {
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
    handleFormChange
  };
};
