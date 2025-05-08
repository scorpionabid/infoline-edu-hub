
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/school';

interface SchoolOperationsResult {
  isSubmitting: boolean;
  addSchool: (schoolData: Partial<School>) => Promise<void>;
  updateSchool: (schoolData: Partial<School>, originalSchool: School | null) => Promise<void>;
  deleteSchool: (school: School | null) => Promise<void>;
  assignAdmin: (schoolId: string, userId: string) => Promise<void>;
  resetAdminPassword: (adminId: string, newPassword: string) => Promise<void>;
  handleAddSubmit: (schoolData: Partial<School>) => Promise<void>;
  handleEditSubmit: (schoolData: Partial<School>, originalSchool: School | null) => Promise<void>;
  handleDeleteConfirm: (school: School | null) => Promise<void>;
  handleAdminUpdate: () => Promise<void>;
  handleResetPassword: (newPassword: string) => Promise<void>;
}

export const useSchoolOperations = (
  onSuccess?: () => void,
  onClose?: (type: 'add' | 'edit' | 'delete' | 'admin') => void
): SchoolOperationsResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const addSchool = useCallback(async (schoolData: Partial<School>) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('schools')
        .insert(schoolData);
      
      if (error) throw error;
      
      if (onSuccess) onSuccess();
      if (onClose) onClose('add');
      
      toast.success(t('schoolCreated') || 'School created successfully');
    } catch (error: any) {
      console.error('Error creating school:', error);
      toast.error(t('errorCreatingSchool') || 'Failed to create school', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, onClose, t]);

  const updateSchool = useCallback(async (schoolData: Partial<School>, originalSchool: School | null) => {
    if (!schoolData.id) {
      toast.error(t('schoolIdRequired') || 'School ID is required for updates');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', schoolData.id);
      
      if (error) throw error;
      
      if (onSuccess) onSuccess();
      if (onClose) onClose('edit');
      
      toast.success(t('schoolUpdated') || 'School updated successfully');
    } catch (error: any) {
      console.error('Error updating school:', error);
      toast.error(t('errorUpdatingSchool') || 'Failed to update school', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, onClose, t]);

  const deleteSchool = useCallback(async (school: School | null) => {
    if (!school?.id) {
      toast.error(t('schoolIdRequired') || 'School ID is required for deletion');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', school.id);
      
      if (error) throw error;
      
      if (onSuccess) onSuccess();
      if (onClose) onClose('delete');
      
      toast.success(t('schoolDeleted') || 'School deleted successfully');
    } catch (error: any) {
      console.error('Error deleting school:', error);
      toast.error(t('errorDeletingSchool') || 'Failed to delete school', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, onClose, t]);

  const assignAdmin = useCallback(async (schoolId: string, userId: string) => {
    // Implementation
    if (onSuccess) onSuccess();
  }, [onSuccess]);

  const resetAdminPassword = useCallback(async (adminId: string, newPassword: string) => {
    // Implementation
    if (onSuccess) onSuccess();
  }, [onSuccess]);

  // For compatibility with useSchoolDialogHandlers
  const handleAddSubmit = addSchool;
  const handleEditSubmit = updateSchool;
  const handleDeleteConfirm = deleteSchool;
  const handleAdminUpdate = async () => {}; // Placeholder
  const handleResetPassword = async (newPassword: string) => {}; // Placeholder

  return {
    isSubmitting,
    addSchool,
    updateSchool,
    deleteSchool,
    assignAdmin,
    resetAdminPassword,
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
    handleAdminUpdate,
    handleResetPassword
  };
};

export default useSchoolOperations;
