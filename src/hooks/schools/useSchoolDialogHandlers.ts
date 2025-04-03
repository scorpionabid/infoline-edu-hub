
import { useState, useCallback } from 'react';
import { School } from '@/types/school';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useSchoolOperations } from './useSchoolOperations';

interface UseSchoolOperationsReturn {
  handleAddSubmit: (formData: any) => Promise<void>;
  handleEditSubmit: (formData: any, selectedSchool: School | null) => Promise<void>;
  handleDeleteConfirm: (selectedSchool: School | null) => Promise<void>;
  handleAdminUpdate: (adminData: any) => void;
  handleResetPassword: (newPassword: string) => void;
}

export const useSchoolDialogHandlers = () => {
  const { t } = useLanguage();
  const { handleAddSubmit: addSchool, handleEditSubmit: editSchool, handleDeleteConfirm: deleteSchool, handleResetPassword: resetPassword, handleAdminUpdate: updateAdmin } = useSchoolOperations(
    () => setIsOperationComplete(true),
    (type: 'add' | 'edit' | 'delete' | 'admin') => closeDialog(type)
  );
  
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
  
  const closeDialog = (type: 'add' | 'edit' | 'delete' | 'admin') => {
    switch (type) {
      case 'add':
        setIsAddDialogOpen(false);
        break;
      case 'edit':
        setIsEditDialogOpen(false);
        break;
      case 'delete':
        setIsDeleteDialogOpen(false);
        break;
      case 'admin':
        setIsAdminDialogOpen(false);
        break;
    }
  };
  
  const closeAddDialog = () => closeDialog('add');
  const closeEditDialog = () => closeDialog('edit');
  const closeDeleteDialog = () => closeDialog('delete');
  const closeAdminDialog = () => closeDialog('admin');
  
  const handleDeleteDialogOpen = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleEditDialogOpen = useCallback((school: School) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      regionId: school.regionId || school.region_id,
      sectorId: school.sectorId || school.sector_id,
      address: school.address,
      email: school.email,
      phone: school.phone,
      principalName: school.principalName || school.principal_name,
      studentCount: school.studentCount || school.student_count,
      teacherCount: school.teacherCount || school.teacher_count,
      type: school.type,
      language: school.language,
      status: school.status,
      adminEmail: school.adminEmail || school.admin_email
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
    closeDeleteDialog,
    closeEditDialog,
    closeAddDialog,
    closeAdminDialog,
    handleDeleteDialogOpen,
    handleEditDialogOpen,
    handleAddDialogOpen,
    handleAdminDialogOpen,
    handleDeleteConfirm: deleteSchool,
    handleEditSubmit: editSchool,
    handleAddSubmit: addSchool,
    handleAdminUpdate: updateAdmin,
    handleResetPassword: resetPassword,
    formData,
    handleFormChange,
    currentTab,
    setCurrentTab,
    setFormData,
    setIsOperationComplete
  };
};
