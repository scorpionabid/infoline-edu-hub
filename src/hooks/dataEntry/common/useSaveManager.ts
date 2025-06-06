
import { useState, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { DataEntryStatus } from '@/types/dataEntry';

export interface SaveResult {
  success: boolean;
  message?: string;
  error?: string;
  status?: DataEntryStatus;
}

export interface UseSaveManagerOptions {
  categoryId: string;
  schoolId: string;
  category: CategoryWithColumns | null;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export interface UseSaveManagerResult {
  isSaving: boolean;
  isSubmitting: boolean;
  saveAsDraft: (formData: Record<string, any>) => Promise<SaveResult>;
  submitForApproval: (formData: Record<string, any>) => Promise<SaveResult>;
  handleExportTemplate?: () => Promise<void>;
  // Wrapper functions for compatibility
  handleSave: () => Promise<void>;
  handleSubmit: () => Promise<void>;
}

export const useSaveManager = ({
  categoryId,
  schoolId,
  category,
  onSaveSuccess,
  onSaveError
}: UseSaveManagerOptions): UseSaveManagerResult => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cachedFormData, setCachedFormData] = useState<Record<string, any>>({});

  const saveAsDraft = useCallback(async (formData: Record<string, any>): Promise<SaveResult> => {
    setIsSaving(true);
    setCachedFormData(formData);
    
    try {
      // Mock save implementation
      console.log('Saving as draft:', { categoryId, schoolId, formData });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }

      return {
        success: true,
        message: 'Data saved successfully',
        status: DataEntryStatus.DRAFT
      };
    } catch (error: any) {
      if (onSaveError) {
        onSaveError(error);
      }
      return {
        success: false,
        error: error.message || 'Save failed'
      };
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, schoolId, onSaveSuccess, onSaveError]);

  const submitForApproval = useCallback(async (formData: Record<string, any>): Promise<SaveResult> => {
    setIsSubmitting(true);
    setCachedFormData(formData);
    
    try {
      // Mock submit implementation
      console.log('Submitting for approval:', { categoryId, schoolId, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        message: 'Data submitted for approval',
        status: DataEntryStatus.PENDING
      };
    } catch (error: any) {
      if (onSaveError) {
        onSaveError(error);
      }
      return {
        success: false,
        error: error.message || 'Submit failed'
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [categoryId, schoolId, onSaveError]);

  const handleExportTemplate = useCallback(async (): Promise<void> => {
    console.log('Exporting template for:', { categoryId, schoolId });
  }, [categoryId, schoolId]);

  // Wrapper functions for compatibility
  const handleSave = useCallback(async (): Promise<void> => {
    const result = await saveAsDraft(cachedFormData);
    if (!result.success && result.error) {
      throw new Error(result.error);
    }
  }, [saveAsDraft, cachedFormData]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    const result = await submitForApproval(cachedFormData);
    if (!result.success && result.error) {
      throw new Error(result.error);
    }
  }, [submitForApproval, cachedFormData]);

  return {
    isSaving,
    isSubmitting,
    saveAsDraft,
    submitForApproval,
    handleExportTemplate,
    handleSave,
    handleSubmit
  };
};

export default useSaveManager;
