
import { useState, useCallback } from 'react';
import { School } from '@/data/schoolsData';
import { toast } from 'sonner';
import { useSchools } from '../useSchools';
import { useSchoolForm } from '../useSchoolForm';
import { School as SupabaseSchool } from '@/types/supabase';

interface MappedSchool {
  id: string;
  name: string;
  principalName: string;
  address: string;
  regionId: string;
  sectorId: string;
  phone: string;
  email: string;
  studentCount: number;
  teacherCount: number;
  status: string;
  type: string;
  language: string;
  adminEmail: string;
}

const mapToMockSchool = (school: SupabaseSchool): MappedSchool => {
  return {
    id: school.id,
    name: school.name,
    principalName: school.principal_name || '',
    address: school.address || '',
    regionId: school.region_id,
    sectorId: school.sector_id,
    phone: school.phone || '',
    email: school.email || '',
    studentCount: school.student_count || 0,
    teacherCount: school.teacher_count || 0,
    status: school.status || 'active',
    type: school.type || '',
    language: school.language || '',
    adminEmail: school.admin_email || ''
  };
};

const convertToSchoolType = (school: SupabaseSchool): School => {
  return {
    id: school.id,
    name: school.name,
    principalName: school.principal_name || '',
    address: school.address || '',
    regionId: school.region_id,
    sectorId: school.sector_id,
    phone: school.phone || '',
    email: school.email || '',
    studentCount: school.student_count || 0,
    teacherCount: school.teacher_count || 0,
    status: school.status || 'active',
    type: school.type || '',
    language: school.language || '',
    createdAt: school.created_at,
    completionRate: school.completion_rate,
    region: '',
    sector: '',
    logo: school.logo || '',
    adminEmail: school.admin_email || ''
  };
};

export const useSchoolDialogHandlers = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<School | null>(null);
  const [isOperationComplete, setIsOperationComplete] = useState(false);
  
  const { addSchool, updateSchool, deleteSchool } = useSchools();
  
  const {
    formData,
    currentTab,
    setCurrentTab,
    setFormDataFromSchool,
    handleFormChange,
    resetForm,
    validateForm
  } = useSchoolForm();

  const openDeleteDialog = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setTimeout(() => {
      setSelectedSchool(null);
    }, 300);
  }, []);

  const openEditDialog = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsEditDialogOpen(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setTimeout(() => {
      setSelectedSchool(null);
    }, 300);
  }, []);

  const openAddDialog = useCallback(() => {
    setIsAddDialogOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
  }, []);

  const openAdminDialog = useCallback((school: School) => {
    setSelectedAdmin(school);
    setIsAdminDialogOpen(true);
  }, []);

  const closeAdminDialog = useCallback(() => {
    setIsAdminDialogOpen(false);
    setTimeout(() => {
      setSelectedAdmin(null);
    }, 300);
  }, []);

  const handleAddDialogOpen = useCallback(() => {
    resetForm();
    openAddDialog();
  }, [resetForm, openAddDialog]);

  const handleEditDialogOpen = useCallback((school: SupabaseSchool) => {
    const mappedSchool = mapToMockSchool(school);
    
    setFormDataFromSchool({
      name: mappedSchool.name,
      principalName: mappedSchool.principalName || '',
      regionId: mappedSchool.regionId,
      sectorId: mappedSchool.sectorId,
      address: mappedSchool.address || '',
      email: mappedSchool.email || '',
      phone: mappedSchool.phone || '',
      studentCount: mappedSchool.studentCount?.toString() || '',
      teacherCount: mappedSchool.teacherCount?.toString() || '',
      status: mappedSchool.status || 'active',
      type: mappedSchool.type || '',
      language: mappedSchool.language || '',
      adminEmail: mappedSchool.adminEmail || '',
      adminFullName: '',
      adminPassword: '',
      adminStatus: 'active'
    });
    openEditDialog(convertToSchoolType(school));
  }, [setFormDataFromSchool, openEditDialog]);

  const handleAdminDialogOpen = useCallback((school: SupabaseSchool) => {
    openAdminDialog(convertToSchoolType(school));
  }, [openAdminDialog]);

  const handleAddSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      const newSchool = {
        name: formData.name,
        principal_name: formData.principalName || null,
        region_id: formData.regionId,
        sector_id: formData.sectorId,
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        student_count: formData.studentCount ? Number(formData.studentCount) : null,
        teacher_count: formData.teacherCount ? Number(formData.teacherCount) : null,
        status: formData.status,
        type: formData.type || null,
        language: formData.language || null,
        admin_email: formData.adminEmail || null,
        logo: null
      };
      
      await addSchool(newSchool);
      
      closeAddDialog();
      setIsOperationComplete(true);
      
      if (formData.adminEmail) {
        toast.success("Məktəb admini uğurla yaradıldı");
      }
    } catch (error) {
      console.error('Error adding school:', error);
    }
  }, [formData, validateForm, addSchool, closeAddDialog, setIsOperationComplete]);

  const handleEditSubmit = useCallback(async () => {
    if (!validateForm() || !selectedSchool) return;
    
    try {
      const updatedSchool = {
        name: formData.name,
        principal_name: formData.principalName || null,
        region_id: formData.regionId,
        sector_id: formData.sectorId,
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        student_count: formData.studentCount ? Number(formData.studentCount) : null,
        teacher_count: formData.teacherCount ? Number(formData.teacherCount) : null,
        status: formData.status,
        type: formData.type || null,
        language: formData.language || null,
        admin_email: formData.adminEmail || null
      };
      
      await updateSchool(selectedSchool.id, updatedSchool);
      
      closeEditDialog();
      setIsOperationComplete(true);
    } catch (error) {
      console.error('Error updating school:', error);
    }
  }, [formData, selectedSchool, validateForm, updateSchool, closeEditDialog, setIsOperationComplete]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSchool) return;
    
    try {
      await deleteSchool(selectedSchool.id);
      
      closeDeleteDialog();
      setIsOperationComplete(true);
    } catch (error) {
      console.error('Error deleting school:', error);
    }
  }, [selectedSchool, deleteSchool, closeDeleteDialog, setIsOperationComplete]);

  const handleAdminUpdate = useCallback(() => {
    toast.success("Admin məlumatları yeniləndi");
    closeAdminDialog();
    setIsOperationComplete(true);
  }, [closeAdminDialog, setIsOperationComplete]);

  const handleResetPassword = useCallback((newPassword: string) => {
    if (!selectedAdmin) return;
    
    const adminEmail = selectedAdmin.adminEmail;
    
    toast.success(`${adminEmail} üçün yeni parol təyin edildi`, {
      description: "Admin növbəti daxil olduqda bu parolu istifadə edəcək."
    });
    
    closeAdminDialog();
    setIsOperationComplete(true);
  }, [selectedAdmin, closeAdminDialog, setIsOperationComplete]);

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
    openEditDialog,
    closeEditDialog,
    openAddDialog,
    closeAddDialog,
    openAdminDialog,
    closeAdminDialog,
    handleAddDialogOpen,
    handleEditDialogOpen,
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
