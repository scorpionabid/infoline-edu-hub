
import { useCallback, useState } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { DataEntryStatus } from '@/types/dataEntry';
import { 
  useDataLoader, 
  useSaveManager, 
  useStatusManager, 
  useFormManager 
} from '@/hooks/dataEntry/common';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

export interface UseUnifiedDataEntryManagerProps {
  categoryId: string;
  schoolId: string;
  category?: CategoryWithColumns | null;
}

export interface UseUnifiedDataEntryManagerResult {
  // Form state
  formData: Record<string, any>;
  isDataModified: boolean;
  validationErrors: Record<string, string>;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Status management
  entryStatus: DataEntryStatus;
  statusPermissions: any;
  readOnly: boolean;
  
  // Actions
  handleFieldChange: (fieldId: string, value: any) => void;
  handleSave: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleExportTemplate?: () => Promise<void>;
  handleUploadData?: (file: File) => Promise<void>;
  validateForm: () => { isValid: boolean; errors: Record<string, string> };
  resetForm: () => void;
  
  // Utils
  completionStatus: () => { completed: number; total: number; percentage: number };
}

export const useUnifiedDataEntryManager = ({
  categoryId,
  schoolId,
  category
}: UseUnifiedDataEntryManagerProps): UseUnifiedDataEntryManagerResult => {
  const { t } = useLanguage();
  
  // Data loading
  const { isLoading, error, loadData } = useDataLoader({ categoryId, schoolId });
  
  // Form management
  const {
    formData,
    isDataModified,
    validationErrors,
    handleFieldChange,
    validateForm,
    resetForm,
    completionStatus
  } = useFormManager({ categoryId, schoolId, category });
  
  // Save management
  const { 
    isSaving, 
    isSubmitting, 
    saveAsDraft, 
    submitForApproval,
    handleExportTemplate
  } = useSaveManager({
    categoryId,
    schoolId,
    category,
    onSaveSuccess: () => toast.success(t('dataSaved') || 'Data saved successfully'),
    onSaveError: (error) => toast.error(error.message || 'Save failed')
  });
  
  // Status management
  const { 
    entryStatus, 
    statusPermissions, 
    readOnly 
  } = useStatusManager({ 
    categoryId, 
    schoolId 
  });

  // Save handler
  const handleSave = useCallback(async () => {
    try {
      await saveAsDraft(formData);
      toast.success('Data saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Save failed');
    }
  }, [saveAsDraft, formData]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    try {
      await submitForApproval(formData);
      toast.success('Data submitted for approval');
    } catch (error: any) {
      toast.error(error.message || 'Submit failed');
    }
  }, [submitForApproval, formData, validateForm]);

  return {
    // Form state
    formData,
    isDataModified,
    validationErrors,
    
    // Loading states
    isLoading,
    isSaving,
    isSubmitting,
    error,
    
    // Status management
    entryStatus,
    statusPermissions,
    readOnly,
    
    // Actions
    handleFieldChange,
    handleSave,
    handleSubmit,
    handleExportTemplate,
    validateForm,
    resetForm,
    
    // Utils
    completionStatus
  };
};

export default useUnifiedDataEntryManager;
