
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
  saveAsDraft: (formData: Record<string, any>) => Promise<void>;
  submitForApproval: (formData: Record<string, any>) => Promise<void>;
  handleExportTemplate?: () => Promise<void>;
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

  const saveAsDraft = useCallback(async (formData: Record<string, any>): Promise<void> => {
    setIsSaving(true);
    
    try {
      // Mock save implementation
      console.log('Saving as draft:', { categoryId, schoolId, formData });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {
      if (onSaveError) {
        onSaveError(error);
      }
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, schoolId, onSaveSuccess, onSaveError]);

  const submitForApproval = useCallback(async (formData: Record<string, any>): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Mock submit implementation
      console.log('Submitting for approval:', { categoryId, schoolId, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error: any) {
      if (onSaveError) {
        onSaveError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [categoryId, schoolId, onSaveError]);

  const handleExportTemplate = useCallback(async (): Promise<void> => {
    console.log('Exporting template for:', { categoryId, schoolId });
  }, [categoryId, schoolId]);

  return {
    isSaving,
    isSubmitting,
    saveAsDraft,
    submitForApproval,
    handleExportTemplate
  };
};

export default useSaveManager;
