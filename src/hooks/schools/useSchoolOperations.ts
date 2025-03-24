
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useSchools } from '../useSchools';
import { SchoolFormData } from '@/types/school-form';
import { School } from '@/data/schoolsData';

interface UseSchoolOperationsReturn {
  handleAddSubmit: (formData: SchoolFormData) => Promise<void>;
  handleEditSubmit: (formData: SchoolFormData, selectedSchool: School | null) => Promise<void>;
  handleDeleteConfirm: (selectedSchool: School | null) => Promise<void>;
  handleAdminUpdate: () => void;
  handleResetPassword: (newPassword: string) => void;
}

export const useSchoolOperations = (
  onSuccess: () => void,
  onCloseDialog: (type: 'add' | 'edit' | 'delete' | 'admin') => void
): UseSchoolOperationsReturn => {
  const { addSchool, updateSchool, deleteSchool } = useSchools();

  const handleAddSubmit = useCallback(async (formData: SchoolFormData) => {
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
      
      onCloseDialog('add');
      onSuccess();
      
      if (formData.adminEmail) {
        toast.success("Məktəb admini uğurla yaradıldı");
      }
    } catch (error) {
      console.error('Error adding school:', error);
    }
  }, [addSchool, onCloseDialog, onSuccess]);

  const handleEditSubmit = useCallback(async (formData: SchoolFormData, selectedSchool: School | null) => {
    if (!selectedSchool) return;
    
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
      
      onCloseDialog('edit');
      onSuccess();
    } catch (error) {
      console.error('Error updating school:', error);
    }
  }, [updateSchool, onCloseDialog, onSuccess]);

  const handleDeleteConfirm = useCallback(async (selectedSchool: School | null) => {
    if (!selectedSchool) return;
    
    try {
      await deleteSchool(selectedSchool.id);
      
      onCloseDialog('delete');
      onSuccess();
    } catch (error) {
      console.error('Error deleting school:', error);
    }
  }, [deleteSchool, onCloseDialog, onSuccess]);

  const handleAdminUpdate = useCallback(() => {
    toast.success("Admin məlumatları yeniləndi");
    onCloseDialog('admin');
    onSuccess();
  }, [onCloseDialog, onSuccess]);

  const handleResetPassword = useCallback((newPassword: string) => {
    toast.success(`Yeni parol təyin edildi`, {
      description: "Admin növbəti daxil olduqda bu parolu istifadə edəcək."
    });
    
    onCloseDialog('admin');
    onSuccess();
  }, [onCloseDialog, onSuccess]);

  return {
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
    handleAdminUpdate,
    handleResetPassword
  };
};
