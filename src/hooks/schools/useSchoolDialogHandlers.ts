import { useState, useCallback } from 'react';
import { School } from '@/types/school';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useSchoolOperations } from './useSchoolOperations';

export const useSchoolDialogHandlers = () => {
  const { t } = useLanguage();
  const { createSchool, updateSchool, deleteSchool, resetPassword: resetPasswordOperation } = useSchoolOperations();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  const [currentTab, setCurrentTab] = useState('basicInfo');
  const [formData, setFormData] = useState<any>({
    name: '',
    regionId: '',
    sectorId: '',
    address: '',
    email: '',
    phone: '',
    principalName: '',
    studentCount: 0,
    teacherCount: 0,
    type: '',
    language: '',
    status: 'active',
    adminEmail: ''
  });
  
  const handleDeleteDialogOpen = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleEditDialogOpen = useCallback((school: School) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      regionId: school.regionId,
      sectorId: school.sectorId,
      address: school.address,
      email: school.email,
      phone: school.phone,
      principalName: school.principalName,
      studentCount: school.studentCount,
      teacherCount: school.teacherCount,
      type: school.type,
      language: school.language,
      status: school.status,
      adminEmail: school.adminEmail
    });
    setIsEditDialogOpen(true);
    setCurrentTab('basicInfo');
  }, []);

  const handleAddDialogOpen = useCallback(() => {
    setFormData({
      name: '',
      regionId: '',
      sectorId: '',
      address: '',
      email: '',
      phone: '',
      principalName: '',
      studentCount: 0,
      teacherCount: 0,
      type: '',
      language: '',
      status: 'active',
      adminEmail: ''
    });
    setIsAddDialogOpen(true);
    setCurrentTab('basicInfo');
  }, []);

  const handleAdminDialogOpen = useCallback((admin: any) => {
    setSelectedAdmin(admin);
    setIsAdminDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSchool) return;
    try {
      await deleteSchool(selectedSchool.id);
      toast.success(t('schoolDeleted', { schoolName: selectedSchool.name }));
      setIsDeleteDialogOpen(false);
      setIsOperationComplete(true);
    } catch (error: any) {
      toast.error(t('schoolDeleteError', { message: error.message }));
    }
  }, [deleteSchool, selectedSchool, t]);

  const handleEditSubmit = useCallback(async () => {
    if (!selectedSchool) return;
    try {
      await updateSchool(selectedSchool.id, formData);
      toast.success(t('schoolUpdated', { schoolName: formData.name }));
      setIsEditDialogOpen(false);
      setIsOperationComplete(true);
    } catch (error: any) {
      toast.error(t('schoolUpdateError', { message: error.message }));
    }
  }, [updateSchool, formData, selectedSchool, t]);

  const handleAddSubmit = useCallback(async () => {
    try {
      await createSchool(formData);
      toast.success(t('schoolCreated', { schoolName: formData.name }));
      setIsAddDialogOpen(false);
      setIsOperationComplete(true);
    } catch (error: any) {
      toast.error(t('schoolCreateError', { message: error.message }));
    }
  }, [createSchool, formData, t]);

  const handleAdminUpdate = useCallback(async (userId: string, role: string, regionId: string | null = null, sectorId: string | null = null, schoolId: string | null = null) => {
    try {
      //await updateAdminRole(userId, role, regionId, sectorId, schoolId);
      toast.success(t('adminRoleUpdated'));
      setIsAdminDialogOpen(false);
      setIsOperationComplete(true);
    } catch (error: any) {
      toast.error(t('adminRoleUpdateError', { message: error.message }));
    }
  }, [t]);

  const handleResetPassword = useCallback(async (email: string) => {
    try {
      await resetPasswordOperation(email);
      toast.success(t('passwordResetLinkSent'));
    } catch (error: any) {
      toast.error(t('passwordResetError', { message: error.message }));
    }
  }, [resetPasswordOperation, t]);
  
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };
  
  return {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isAdminDialogOpen,
    selectedSchool,
    selectedAdmin,
    isOperationComplete,
    closeDeleteDialog: () => setIsDeleteDialogOpen(false),
    closeEditDialog: () => setIsEditDialogOpen(false),
    closeAddDialog: () => setIsAddDialogOpen(false),
    closeAdminDialog: () => setIsAdminDialogOpen(false),
    handleDeleteDialogOpen,
    handleEditDialogOpen,
    handleAddDialogOpen,
    handleAdminDialogOpen,
    handleDeleteConfirm,
    handleEditSubmit,
    handleAddSubmit,
    handleAdminUpdate,
    handleResetPassword,
    formData,
    handleFormChange,
    currentTab,
    setCurrentTab,
    setFormData, // Add this explicitly
    setIsOperationComplete
  };
};
