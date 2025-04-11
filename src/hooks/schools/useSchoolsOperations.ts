import { useCallback } from 'react';
import { toast } from 'sonner';
import { useSchools } from '../useSchools';
import { SchoolFormData } from '@/types/school-form';
import { School, adaptSchoolToSupabase } from '@/types/supabase';
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
      
      // Məktəb məlumatlarını uyğun tiplərə çeviririk
      const newSchool: Partial<School> = {
        name: formData.name,
        principalName: formData.principalName || null,
        regionId: formData.regionId || null,
        sectorId: formData.sectorId,
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        studentCount: formData.studentCount ? Number(formData.studentCount) : null,
        teacherCount: formData.teacherCount ? Number(formData.teacherCount) : null,
        status: formData.status as 'active' | 'inactive',
        type: formData.type || null,
        language: formData.language || null,
        adminEmail: formData.adminEmail || null,
        logo: null
      };
      
      // Supabase formatına çevir
      const supabaseData = adaptSchoolToSupabase(newSchool);
      
      const result = await addSchool(supabaseData);
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
      
      // Məktəb məlumatlarını uyğun tiplərə çeviririk
      const updatedSchool: Partial<School> = {
        name: formData.name,
        principalName: formData.principalName || null,
        regionId: formData.regionId,
        sectorId: formData.sectorId,
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        studentCount: formData.studentCount ? Number(formData.studentCount) : null,
        teacherCount: formData.teacherCount ? Number(formData.teacherCount) : null,
        status: formData.status as 'active' | 'inactive',
        type: formData.type || null,
        language: formData.language || null,
        adminEmail: formData.adminEmail || null
      };
      
      // Supabase formatına çevir
      const supabaseData = adaptSchoolToSupabase(updatedSchool);
      
      const result = await updateSchool(selectedSchool.id, supabaseData);
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
      await deleteSchool(selectedSchool.id);
      console.log("Məktəb silindi:", selectedSchool.id);
      
      toast.success("Məktəb uğurla silindi", {
        description: `${selectedSchool.name} məktəbi sistemdə silindi`
      });
      
      onCloseDialog('delete');
      onSuccess();
    } catch (error) {
      console.error('Məktəb silinərkən xəta:', error);
      toast.error("Məktəb silinərkən xəta", {
        description: "Məktəb silinərkən bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
      });
    }
  }, [deleteSchool, onCloseDialog, onSuccess]);

  const handleAdminUpdate = useCallback(() => {
    // Implement admin update logic here
  }, []);

  const handleResetPassword = useCallback((newPassword: string) => {
    // Implement password reset logic here
  }, []);

  const handleAssignAdmin = useCallback(async (schoolId: string, userId: string) => {
    try {
      await supabase.auth.admin.updateUser(userId, { role: 'admin' });
      console.log("Admin təyin edildi:", userId);
      
      toast.success("Admin təyin edildi", {
        description: `${userId} e-poçt ünvanı ilə admin təyin edildi`
      });
      
      return true;
    } catch (error) {
      console.error('Admin təyin edilərkən xəta:', error);
      toast.error("Admin təyin edilərkən xəta", {
        description: "Admin təyin edilərkən bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
      });
      return false;
    }
  }, []);

  return {
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
    handleAdminUpdate,
    handleResetPassword,
    handleAssignAdmin
  };
};
