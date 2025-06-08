
import { useCallback, useState } from 'react';
import { useDataEntry } from '../useDataEntry';
import { useDataEntryValidation } from './useDataEntryValidation';
import { useDataEntryProgress } from './useDataEntryProgress';
import { useDataEntryFormState } from './useDataEntryFormState';
import { useAutoSave } from '@/hooks/dataEntry/useAutoSave';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

export interface UseDataEntryManagerProps {
  categoryId: string;
  schoolId: string;
  autoSaveEnabled?: boolean;
  onComplete?: () => void;
}

/**
 * Comprehensive data entry manager hook
 * Combines all data entry functionality into a single interface
 */
export function useDataEntryManager({
  categoryId,
  schoolId,
  autoSaveEnabled = true,
  onComplete
}: UseDataEntryManagerProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Core data entry hook
  const {
    category,
    columns,
    entries,
    isLoading,
    isError,
    error,
    updateEntryValue,
    saveAll,
    submitAll,
    refetchAll,
    isSaving
  } = useDataEntry({ categoryId, schoolId, onComplete });
  
  // Form state management
  const {
    formData,
    isDirty,
    updateField,
    updateFields,
    resetForm,
    markAsSaved,
    getFieldValue,
    hasFieldValue,
    getFormAsEntries
  } = useDataEntryFormState({
    columns: columns || [],
    entries: entries || []
  });
  
  // Validation
  const {
    validationResult,
    getFieldError,
    getFieldWarning,
    hasAllRequiredFields,
    isValid
  } = useDataEntryValidation({
    columns: columns || [],
    entries: entries || [],
    formData
  });
  
  // Progress tracking
  const {
    progressMetrics,
    isReadyForSubmission,
    getProgressStatus
  } = useDataEntryProgress({
    columns: columns || [],
    entries: entries || [],
    formData
  });
  
  // Auto-save
  const {
    saveNow: autoSaveNow,
    isSaving: isAutoSaving,
    autoSaveEnabled: autoSaveActive
  } = useAutoSave({
    formData,
    isDataModified: isDirty,
    enabled: autoSaveEnabled && !isLoading
  });
  
  // Enhanced field update that syncs with data entry
  const handleFieldChange = useCallback(async (fieldId: string, value: any) => {
    // Update local form state
    updateField(fieldId, value);
    
    // Update entry in backend
    try {
      await updateEntryValue({ columnId: fieldId, value });
    } catch (error) {
      console.error('Failed to update entry:', error);
      toast.error(t('failedToUpdateEntry') || 'Failed to update entry');
    }
  }, [updateField, updateEntryValue, t]);
  
  // Enhanced save function
  const handleSave = useCallback(async () => {
    if (isSaving) return;
    
    try {
      await saveAll();
      markAsSaved();
      toast.success(t('dataSaved') || 'Data saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(t('saveFailed') || 'Failed to save data');
    }
  }, [saveAll, markAsSaved, isSaving, t]);
  
  // Enhanced submit function
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !isReadyForSubmission) return;
    
    try {
      setIsSubmitting(true);
      await submitAll();
      markAsSaved();
      toast.success(t('dataSubmitted') || 'Data submitted successfully');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error(t('submitFailed') || 'Failed to submit data');
    } finally {
      setIsSubmitting(false);
    }
  }, [submitAll, markAsSaved, isSubmitting, isReadyForSubmission, onComplete, t]);
  
  // Get field props for easy form integration
  const getFieldProps = useCallback((fieldId: string) => {
    const column = columns?.find(col => col.id === fieldId);
    if (!column) return null;
    
    return {
      value: getFieldValue(fieldId),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(fieldId, e.target.value),
      onValueChange: (value: any) => handleFieldChange(fieldId, value),
      error: getFieldError(fieldId),
      warning: getFieldWarning(fieldId),
      required: column.is_required,
      disabled: isLoading || isSubmitting,
      placeholder: column.placeholder
    };
  }, [columns, getFieldValue, handleFieldChange, getFieldError, getFieldWarning, isLoading, isSubmitting]);
  
  return {
    // Data and loading states
    category,
    columns: columns || [],
    entries: entries || [],
    isLoading,
    isError,
    error,
    
    // Form state
    formData,
    isDirty,
    isSubmitting,
    
    // Validation
    validationResult,
    isValid,
    hasAllRequiredFields,
    getFieldError,
    getFieldWarning,
    
    // Progress
    progressMetrics,
    isReadyForSubmission,
    getProgressStatus,
    completionPercentage: progressMetrics.completionPercentage,
    
    // Auto-save
    isAutoSaving,
    autoSaveActive,
    autoSaveNow,
    
    // Actions
    handleFieldChange,
    handleSave,
    handleSubmit,
    resetForm,
    refetchAll,
    
    // Utilities
    getFieldValue,
    hasFieldValue,
    getFieldProps,
    getFormAsEntries: () => getFormAsEntries(categoryId, schoolId)
  };
}

export default useDataEntryManager;
