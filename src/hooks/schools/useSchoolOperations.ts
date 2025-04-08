
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useSchools } from '../useSchools';
import { SchoolFormData } from '@/types/school-form';
import { School } from '@/data/schoolsData';
import { supabase } from '@/integrations/supabase/client';

interface UseSchoolOperationsReturn {
  handleAddSubmit: (formData: SchoolFormData) => Promise<void>;
  handleEditSubmit: (formData: SchoolFormData, selectedSchool: School | null) => Promise<void>;
  handleDeleteConfirm: (selectedSchool: School | null) => Promise<void>;
  handleAdminUpdate: () => void;
  handleResetPassword: (newPassword: string) => void;
  handleAssignAdmin: (schoolId: string, userId: string) => Promise<boolean>;
}

export const useSchoolOperations = (
  onSuccess: () => void,
  onCloseDialog: (type: 'add' | 'edit' | 'delete' | 'admin') => void
): UseSchoolOperationsReturn => {
  const { addSchool, updateSchool, deleteSchool } = useSchools();

  const handleAddSubmit = useCallback(async (formData: SchoolFormData) => {
    try {
      console.log("Məktəb əlavə edilir:", formData);
      
      // Yoxla region ID-si boşdursa, supabase-ə boş (null) ötürmək üçün
      const newSchool = {
        name: formData.name,
        principal_name: formData.principalName || null,
        region_id: formData.regionId || null, // Əgər regionId boşdursa null ötürür
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
      
      const result = await addSchool(newSchool);
      console.log("Əlavə edilən məktəb:", result);
      
      toast.success("Məktəb uğurla əlavə edildi", {
        description: `${formData.name} məktəbi sistemə əlavə olundu`
      });
      
      onCloseDialog('add');
      onSuccess();
      
      if (formData.adminEmail) {
        toast.success("Məktəb admini uğurla yaradıldı", {
          description: `${formData.adminEmail} e-poçt ünvanı ilə admin yaradıldı`
        });
      }
    } catch (error) {
      console.error('Məktəb əlavə edilərkən xəta baş verdi:', error);
      toast.error("Məktəb əlavə edilərkən xəta", {
        description: "Məktəb əlavə edilərkən bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
      });
    }
  }, [addSchool, onCloseDialog, onSuccess]);

  const handleEditSubmit = useCallback(async (formData: SchoolFormData, selectedSchool: School | null) => {
    if (!selectedSchool) return;
    
    try {
      console.log("Məktəb yenilənir:", formData);
      
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
      
      const result = await updateSchool(selectedSchool.id, updatedSchool);
      console.log("Yenilənən məktəb:", result);
      
      toast.success("Məktəb uğurla yeniləndi", {
        description: `${formData.name} məktəbinin məlumatları yeniləndi`
      });
      
      onCloseDialog('edit');
      onSuccess();
    } catch (error) {
      console.error('Məktəb yenilənərkən xəta baş verdi:', error);
      toast.error("Məktəb yenilənərkən xəta", {
        description: "Məktəb yenilənərkən bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
      });
    }
  }, [updateSchool, onCloseDialog, onSuccess]);

  const handleDeleteConfirm = useCallback(async (selectedSchool: School | null) => {
    if (!selectedSchool) return;
    
    try {
      console.log("Məktəb silinir:", selectedSchool.id);
      
      await deleteSchool(selectedSchool.id);
      
      toast.success("Məktəb uğurla silindi", {
        description: `${selectedSchool.name} məktəbi sistemdən silindi`
      });
      
      onCloseDialog('delete');
      onSuccess();
    } catch (error) {
      console.error('Məktəb silinərkən xəta baş verdi:', error);
      toast.error("Məktəb silinərkən xəta", {
        description: "Məktəb silinərkən bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
      });
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

  const handleAssignAdmin = useCallback(async (schoolId: string, userId: string) => {
    try {
      console.log('Məktəb admini təyin edilir:', { schoolId, userId });
      
      const { data, error } = await supabase.functions.invoke('assign-existing-user-as-school-admin', {
        body: { schoolId, userId }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Məktəb admini təyin edilərkən xəta');
      }
      
      toast.success('Məktəb admini uğurla təyin edildi');
      onSuccess();
      return true;
    } catch (error) {
      console.error('Məktəb admini təyin edilərkən xəta:', error);
      toast.error('Məktəb admini təyin edilərkən xəta', {
        description: error.message
      });
      return false;
    }
  }, [onSuccess]);

  return {
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
    handleAdminUpdate,
    handleResetPassword,
    handleAssignAdmin
  };
};
