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
}

export const useSchoolOperations = (
  onSuccess: () => void,
  onCloseDialog: (type: 'add' | 'edit' | 'delete' | 'admin') => void
): UseSchoolOperationsReturn => {
  const { addSchool, updateSchool, deleteSchool } = useSchools();

  const handleAddSubmit = useCallback(async (formData: SchoolFormData) => {
    try {
      console.log("Məktəb əlavə edilir:", formData);
      
      // İlk öncə eyni adlı məktəb və ya eyni admin e-poçtu ilə məktəb olub-olmadığını yoxlayaq
      if (formData.adminEmail) {
        const { data: existingSchools, error: checkError } = await supabase
          .from('schools')
          .select('id, name')
          .eq('admin_email', formData.adminEmail);
        
        if (checkError) {
          console.error('Mövcud məktəbləri yoxlayarkən xəta:', checkError);
        } else if (existingSchools && existingSchools.length > 0) {
          toast.error("Admin e-poçtu artıq istifadə olunur", {
            description: `${existingSchools[0].name} məktəbi eyni admin e-poçtu istifadə edir`
          });
          return;
        }
      }
      
      // Eyni adlı məktəbin olub-olmadığını yoxlayaq
      const { data: nameCheck, error: nameCheckError } = await supabase
        .from('schools')
        .select('id')
        .eq('name', formData.name);
      
      if (!nameCheckError && nameCheck && nameCheck.length > 0) {
        toast.error("Məktəb adı artıq mövcuddur", {
          description: `${formData.name} adı ilə məktəb artıq mövcuddur`
        });
        return;
      }
      
      // Supabase gözlədiyi tip formatında verilənləri düzləndirib göndəririk
      const newSchool = {
        name: formData.name,
        principalName: formData.principalName || null,
        regionId: formData.regionId,
        sectorId: formData.sectorId,
        region_id: formData.regionId, // Edge Function-a uyğunlaşdırmaq üçün əlavə edildi
        sector_id: formData.sectorId, // Edge Function-a uyğunlaşdırmaq üçün əlavə edildi
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        studentCount: formData.studentCount ? Number(formData.studentCount) : null,
        teacherCount: formData.teacherCount ? Number(formData.teacherCount) : null,
        status: formData.status,
        type: formData.type || null,
        language: formData.language || null,
        adminEmail: formData.adminEmail || null,
        adminFullName: formData.adminFullName || null,
        adminPassword: formData.adminPassword || null,
        adminStatus: formData.adminStatus || 'active'
      };
      
      // Məktəbi yaradaq
      const result = await addSchool(newSchool);
      
      console.log("Əlavə edilən məktəb:", result);
      
      toast.success("Məktəb uğurla əlavə edildi", {
        description: `${formData.name} məktəbi sistemə əlavə olundu`
      });
      
      // Dialoqu bağlayaq və məlumatları yeniləyək
      onCloseDialog('add');
      onSuccess();
      
      // Admin yaradılıbsa bildiriş göstərək
      if (formData.adminEmail) {
        toast.success("Məktəb admini uğurla yaradıldı", {
          description: `${formData.adminEmail} e-poçt ünvanı ilə admin yaradıldı`
        });
      }
    } catch (error: any) {
      console.error('Məktəb əlavə edilərkən xəta baş verdi:', error);
      
      let errorMessage = "Məktəb əlavə edilərkən bir xəta baş verdi.";
      
      // Xəta mesajını göstər
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error("Məktəb əlavə edilərkən xəta", {
        description: errorMessage
      });
    }
  }, [addSchool, onCloseDialog, onSuccess]);

  const handleEditSubmit = useCallback(async (formData: SchoolFormData, selectedSchool: School | null) => {
    if (!selectedSchool) return;
    
    try {
      console.log("Məktəb yenilənir:", formData);
      
      const updatedSchool = {
        name: formData.name,
        principalName: formData.principalName || null,
        regionId: formData.regionId,
        sectorId: formData.sectorId,
        region_id: formData.regionId, // Əlavə edildi
        sector_id: formData.sectorId, // Əlavə edildi
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        studentCount: formData.studentCount ? Number(formData.studentCount) : null,
        teacherCount: formData.teacherCount ? Number(formData.teacherCount) : null,
        status: formData.status,
        type: formData.type || null,
        language: formData.language || null,
        adminEmail: formData.adminEmail || null
      };
      
      const result = await updateSchool(selectedSchool.id, updatedSchool);
      console.log("Yenilənən məktəb:", result);
      
      toast.success("Məktəb uğurla yeniləndi", {
        description: `${formData.name} məktəbinin məlumatları yeniləndi`
      });
      
      onCloseDialog('edit');
      onSuccess();
    } catch (error: any) {
      console.error('Məktəb yenilənərkən xəta baş verdi:', error);
      
      let errorMessage = "Məktəb yenilənərkən bir xəta baş verdi.";
      
      // Edge function-dan gələn xəta mesajını göstər
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (error.data && error.data.error) {
        errorMessage = error.data.error;
      }
      
      toast.error("Məktəb yenilənərkən xəta", {
        description: errorMessage
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
    } catch (error: any) {
      console.error('Məktəb silinərkən xəta baş verdi:', error);
      
      let errorMessage = "Məktəb silinərkən bir xəta baş verdi.";
      
      // Edge function-dan gələn xəta mesajını göstər
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (error.data && error.data.error) {
        errorMessage = error.data.error;
      }
      
      toast.error("Məktəb silinərkən xəta", {
        description: errorMessage
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

  return {
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
    handleAdminUpdate,
    handleResetPassword
  };
};
