
import { useCallback } from 'react';
import { School } from '@/types/supabase';
import { SchoolFormData } from '@/types/school-form';
import { 
  addSchool, 
  updateSchool, 
  deleteSchool, 
  assignSchoolAdmin, 
  resetSchoolAdminPassword 
} from '@/services/data/schoolService';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface UseSchoolsOperationsProps {
  onSuccess: () => void;
}

/**
 * Məktəb əməliyyatları üçün hook
 */
export const useSchoolsOperations = ({ onSuccess }: UseSchoolsOperationsProps) => {
  const { t } = useLanguage();

  const handleAdd = useCallback(async (formData: SchoolFormData): Promise<School | null> => {
    try {
      const schoolData = {
        name: formData.name,
        principal_name: formData.principalName || null,
        region_id: formData.regionId,
        sector_id: formData.sectorId,
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        student_count: formData.studentCount ? parseInt(formData.studentCount) : null,
        teacher_count: formData.teacherCount ? parseInt(formData.teacherCount) : null,
        status: formData.status,
        type: formData.type || null,
        language: formData.language || null,
        admin_email: formData.adminEmail || null,
      };
      
      const result = await addSchool(schoolData);
      onSuccess();
      return result;
    } catch (error) {
      console.error('Məktəb əlavə edilərkən xəta:', error);
      return null;
    }
  }, [onSuccess]);

  const handleUpdate = useCallback(async (id: string, formData: SchoolFormData): Promise<School | null> => {
    try {
      const schoolData = {
        name: formData.name,
        principal_name: formData.principalName || null,
        region_id: formData.regionId,
        sector_id: formData.sectorId,
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        student_count: formData.studentCount ? parseInt(formData.studentCount) : null,
        teacher_count: formData.teacherCount ? parseInt(formData.teacherCount) : null,
        status: formData.status,
        type: formData.type || null,
        language: formData.language || null,
        admin_email: formData.adminEmail || null,
      };
      
      const result = await updateSchool(id, schoolData);
      onSuccess();
      return result;
    } catch (error) {
      console.error('Məktəb yenilənərkən xəta:', error);
      return null;
    }
  }, [onSuccess]);

  const handleDelete = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteSchool(id);
      onSuccess();
      return true;
    } catch (error) {
      console.error('Məktəb silinərkən xəta:', error);
      return false;
    }
  }, [onSuccess]);

  const handleAssignAdmin = useCallback(async (schoolId: string, adminEmail: string): Promise<boolean> => {
    try {
      await assignSchoolAdmin(schoolId, adminEmail);
      onSuccess();
      return true;
    } catch (error) {
      console.error('Admin təyin edilərkən xəta:', error);
      return false;
    }
  }, [onSuccess]);

  const handleResetPassword = useCallback(async (adminEmail: string, newPassword: string): Promise<boolean> => {
    try {
      await resetSchoolAdminPassword(adminEmail, newPassword);
      onSuccess();
      return true;
    } catch (error) {
      console.error('Şifrə sıfırlanarkən xəta:', error);
      return false;
    }
  }, [onSuccess]);

  return {
    handleAdd,
    handleUpdate,
    handleDelete,
    handleAssignAdmin,
    handleResetPassword
  };
};
