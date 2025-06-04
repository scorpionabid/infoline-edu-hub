// Simplified School Admin Data Entry Hook
// Uses common hooks to avoid duplication
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { CategoryWithColumns } from '@/types/category';
import { useFormManager, useDataLoader, useSaveManager, useStatusManager } from '../common';
import { useCallback, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface UseSchoolDataEntryOptions {
  categoryId?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

/**
 * Simplified hook for School Admin data entry
 * Uses common hooks for consistency and to avoid duplication
 */
export const useSchoolDataEntry = (options: UseSchoolDataEntryOptions = {}) => {
  const { categoryId = '', autoSave = true, autoSaveInterval = 30000 } = options;
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  
  // Ensure user is school admin with school assignment
  const schoolId = user?.school_id || '';
  const isSchoolAdmin = user?.role === 'schooladmin';
  
  // Use common hooks
  const formManager = useFormManager({ 
    categoryId, 
    schoolId, 
    category: null // Will be loaded
  });
  
  const dataLoader = useDataLoader({ categoryId, schoolId });
  
  const saveManager = useSaveManager({
    categoryId,
    schoolId,
    category: null, // Will be updated when loaded
    onSaveSuccess: () => {
      formManager.setInitialData(formManager.formData);
    }
  });
  
  const statusManager = useStatusManager({ categoryId, schoolId });
  
  // Load category and data
  const loadCategoryAndData = useCallback(async () => {
    if (!categoryId || !schoolId) return;
    
    try {
      // Load categories first to get the specific category
      const categories = await dataLoader.loadCategories();
      const category = categories.find(cat => cat.id === categoryId);
      
      if (category) {
        // Load existing data
        const result = await dataLoader.loadData(schoolId, categoryId);
        if (result) {
          formManager.setInitialData(result.data);
          formManager.setEntries(result.entries);
          
          if (result.entries.length > 0) {
            statusManager.updateStatus(result.entries[0].status as any);
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading category and data:', error);
      toast({
        title: t('error'),
        description: t('errorLoadingData'),
        variant: 'destructive'
      });
    }
  }, [categoryId, schoolId, dataLoader, formManager, statusManager, t, toast]);
  
  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !formManager.isDataModified || saveManager.isSaving) return;
    
    const timer = setTimeout(async () => {
      if (statusManager.canEdit) {
        await saveManager.saveAsDraft(formManager.formData);
      }
    }, autoSaveInterval);
    
    return () => clearTimeout(timer);
  }, [autoSave, formManager.isDataModified, saveManager.isSaving, statusManager.canEdit, autoSaveInterval, saveManager, formManager.formData]);
  
  // Load data when category changes
  useEffect(() => {
    if (categoryId && schoolId) {
      loadCategoryAndData();
    }
  }, [categoryId, schoolId, loadCategoryAndData]);
  
  // Enhanced submit function
  const submitForApproval = useCallback(async () => {
    const validation = formManager.validateForm();
    if (!validation.isValid) {
      toast({
        title: t('validationError'),
        description: t('pleaseFixErrors'),
        variant: 'destructive'
      });
      return;
    }
    
    return await saveManager.submitForApproval(formManager.formData);
  }, [formManager, saveManager, t, toast]);
  
  return {
    // State
    formData: formManager.formData,
    isLoading: dataLoader.isLoading,
    isSaving: saveManager.isSaving,
    isSubmitting: saveManager.isSubmitting,
    hasUnsavedChanges: formManager.isDataModified,
    validationErrors: formManager.validationErrors,
    
    // School info
    schoolId,
    isSchoolAdmin,
    
    // Actions
    updateFormData: formManager.handleFieldChange,
    saveAsDraft: () => saveManager.saveAsDraft(formManager.formData),
    submitForApproval,
    validateForm: formManager.validateForm,
    
    // Status
    entryStatus: statusManager.entryStatus,
    canEdit: statusManager.canEdit,
    canSubmit: statusManager.canSubmit,
    completionStatus: formManager.completionStatus,
    canSubmitForm: formManager.canSubmit,
    
    // Utils
    reload: loadCategoryAndData
  };
};

export default useSchoolDataEntry;
