
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

  const saveAsDraft = useCallback(async (formData: Record<string, any>): Promise<SaveResult> => {
    setIsSaving(true);
    
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
      return {
        success: false,
        error: error.message || 'Submit failed'
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [categoryId, schoolId]);

  return {
    isSaving,
    isSubmitting,
    saveAsDraft,
    submitForApproval
  };
};

export default useSaveManager;
