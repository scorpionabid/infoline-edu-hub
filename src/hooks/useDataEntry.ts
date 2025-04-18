import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useCategoryData } from './dataEntry/useCategoryData';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useFormState } from './form/useFormState';
import { useFormActions } from './form/useFormActions';
import { useFormInitialization } from './form/useFormInitialization';
import { DataEntryForm, EntryValue, DataEntrySaveStatus, UseDataEntryProps, UseDataEntryResult, CategoryWithColumns, ColumnValidationError } from '@/types/dataEntry';

/**
 * @description Məlumatların daxil edilməsi üçün hook
 */
export const useDataEntry = ({
  schoolId,
  categoryId,
  categories: initialCategories,
  onComplete
}: UseDataEntryProps = {}): UseDataEntryResult => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { categories: fetchedCategories, loading: categoriesLoading } = useCategoryData({ schoolId });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [isDataModified, setIsDataModified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [entries, setEntries] = useState<EntryValue[]>([]);
  
  // Categories: Öncelikle initialCategories değerini kullan, yoksa fetchedCategories değerini kullan
  const categories = initialCategories || fetchedCategories;
  
  // Form state
  const { formData, setFormData, updateFormData } = useFormState();
  
  // Select the category based on the categoryId
  const selectedCategory = categories?.find(cat => cat.id === categoryId);
  
  useEffect(() => {
    if (schoolId) {
      updateFormData({ schoolId });
    }
  }, [schoolId, updateFormData]);
  
  useEffect(() => {
    if (categoryId) {
      updateFormData({ categoryId });
    }
  }, [categoryId, updateFormData]);
  
  // Initialize form data
  const { initializeForm } = useFormInitialization({ setFormData });
  
  // Load form data for a specific school
  const loadDataForSchool = useCallback(async (schoolId: string) => {
    if (!schoolId) {
      setError(t('missingSchoolId'));
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch existing entries for the school
      const { data: entriesData, error: entriesError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .is('deleted_at', null);
      
      if (entriesError) {
        throw entriesError;
      }
      
      // Convert the entries from DB format to app format
      const convertedEntries: EntryValue[] = (entriesData || []).map(entry => ({
        id: entry.id,
        columnId: entry.column_id,
        value: entry.value,
        status: entry.status as 'pending' | 'approved' | 'rejected'
      }));
      
      // Set entries
      setEntries(convertedEntries);
      
      // Update form data
      updateFormData({
        schoolId,
        entries: convertedEntries,
        status: getFormStatus(convertedEntries),
        lastSaved: new Date().toISOString()
      });
      
      // If no existing entries, initialize empty form
      if (convertedEntries.length === 0 && categories.length > 0) {
        // Find active category (first one if categoryId not provided)
        const targetCategory = categoryId 
          ? categories.find(cat => cat.id === categoryId) 
          : categories[0];
        
        if (targetCategory) {
          const initialEntries = targetCategory.columns.map(column => ({
            columnId: column.id,
            value: column.default_value || null
          }));
          
          initializeForm(initialEntries as EntryValue[], 'draft');
        }
      }
    } catch (error: any) {
      console.error('Məlumatlar yüklənərkən xəta:', error);
      setError(t('errorLoadingData'));
      toast.error(t('errorLoadingData'), {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [categories, categoryId, initializeForm, t, updateFormData]);
  
  useEffect(() => {
    if (schoolId && categories.length > 0 && !categoriesLoading) {
      loadDataForSchool(schoolId);
    }
  }, [schoolId, categories, categoriesLoading, loadDataForSchool]);
  
  // Helper function to determine form status based on entries
  const getFormStatus = (entries: EntryValue[]): 'draft' | 'pending' | 'approved' | 'rejected' => {
    if (!entries || entries.length === 0) return 'draft';
    
    const hasRejected = entries.some(entry => entry.status === 'rejected');
    const hasPending = entries.some(entry => entry.status === 'pending');
    const hasApproved = entries.some(entry => entry.status === 'approved');
    
    if (hasRejected) return 'rejected';
    if (hasPending) return 'pending';
    if (hasApproved) return 'approved';
    return 'draft';
  };

  // Form actions
  const { 
    isAutoSaving, 
    updateValue, 
    saveForm, 
    submitForm 
  } = useFormActions({
    formData,
    setFormData,
    updateFormData,
    categories
  });
  
  // When entries change, update isDataModified
  useEffect(() => {
    setIsDataModified(true);
  }, [formData.entries]);
  
  // Auto-save setup
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDataModified && !isAutoSaving) {
        handleSave();
      }
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [isDataModified, isAutoSaving]);
  
  // Handle entry value changes
  const handleEntriesChange = useCallback((columnId: string, value: string | number | boolean | null) => {
    if (!categoryId) return;
    
    updateValue(categoryId, columnId, value);
    setIsDataModified(true);
  }, [categoryId, updateValue]);
  
  // Save form data
  const handleSave = useCallback(async () => {
    if (!schoolId || !user?.id) {
      toast.error(t('cannotSaveData'), {
        description: t('missingRequiredInfo')
      });
      return Promise.resolve();
    }
    
    setSaveStatus(DataEntrySaveStatus.SAVING);
    
    try {
      // Batch insert/update for better performance
      const upsertData = formData.entries.map(entry => {
        const { columnId, value } = entry;
        
        if (!columnId) return null;
        
        return {
          school_id: schoolId,
          category_id: categoryId,
          column_id: columnId,
          value: String(value || ''),
          status: 'pending',
          created_by: user.id,
          updated_at: new Date().toISOString()
        };
      }).filter(Boolean);
      
      if (upsertData.length === 0) {
        setSaveStatus(DataEntrySaveStatus.IDLE);
        return Promise.resolve();
      }
      
      // Use upsert operation for better performance
      const { error: upsertError } = await supabase
        .from('data_entries')
        .upsert(upsertData, {
          onConflict: 'school_id,category_id,column_id',
          ignoreDuplicates: false
        });
      
      if (upsertError) {
        throw upsertError;
      }
      
      updateFormData({
        lastSaved: new Date().toISOString(),
        status: 'pending'
      });
      
      setSaveStatus(DataEntrySaveStatus.SAVED);
      setIsDataModified(false);
      
      // Show success message
      toast.success(t('dataSavedSuccessfully'));
      
      setTimeout(() => {
        setSaveStatus(DataEntrySaveStatus.IDLE);
      }, 3000);
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Məlumatları saxlayarkən xəta:', error);
      
      setSaveStatus(DataEntrySaveStatus.ERROR);
      
      toast.error(t('errorSavingData'), {
        description: error.message
      });
      
      setTimeout(() => {
        setSaveStatus(DataEntrySaveStatus.IDLE);
      }, 3000);
      
      return Promise.reject(error);
    }
  }, [formData.entries, schoolId, categoryId, t, updateFormData, user?.id]);

  // Submit form for approval
  const submitForApproval = useCallback(() => {
    setSubmitting(true);
    
    handleSave()
      .then(async () => {
        try {
          // Call Edge Function to submit category for approval
          const { error: submitError } = await supabase.functions.invoke('submit-category-for-approval', {
            body: { 
              schoolId, 
              categoryId,
              userId: user?.id
            }
          });
          
          if (submitError) {
            throw submitError;
          }
          
          updateFormData({
            status: 'pending',
            submittedAt: new Date().toISOString()
          });
          
          toast.success(t('dataSubmittedForApproval'));
          
          if (onComplete) {
            onComplete();
          }
        } catch (error: any) {
          console.error('Təsdiq üçün göndərilən zaman xəta:', error);
          toast.error(t('errorSubmittingData'), {
            description: error.message
          });
        }
      })
      .catch(error => {
        console.error('Təsdiq üçün göndərilən zaman xəta:', error);
        toast.error(t('errorSubmittingData'));
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [handleSave, onComplete, t, updateFormData, schoolId, categoryId, user?.id]);

  // Calculate completion percentage
  const calculateCompletionPercentage = useCallback((entries: EntryValue[], columns: Column[]) => {
    if (!columns || columns.length === 0) return 0;
    
    const requiredColumns = columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 100;
    
    const filledRequiredColumns = requiredColumns.filter(col => {
      const entry = entries.find(e => e.columnId === col.id);
      return entry && entry.value !== null && entry.value !== undefined && entry.value !== '';
    });
    
    return Math.round((filledRequiredColumns.length / requiredColumns.length) * 100);
  }, []);

  // Validate form before submission
  const validateForm = useCallback(() => {
    if (!formData.entries || !categoryId) return false;
    
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (!selectedCategory) return false;
    
    const errors: ColumnValidationError[] = [];
    
    selectedCategory.columns.forEach(column => {
      const entry = formData.entries.find(e => e.columnId === column.id);
      const value = entry ? entry.value : null;
      
      // Check required fields
      if (column.is_required && (value === null || value === undefined || value === '')) {
        errors.push({
          columnId: column.id,
          message: t('fieldIsRequired'),
          columnName: column.name
        });
        return;
      }
      
      // Skip validation if value is empty and not required
      if (!column.is_required && (value === null || value === undefined || value === '')) {
        return;
      }
      
      // Validate based on column type
      if (column.type === 'number') {
        const numValue = Number(value);
        
        if (isNaN(numValue)) {
          errors.push({
            columnId: column.id,
            message: t('invalidNumber'),
            columnName: column.name
          });
          return;
        }
        
        if (column.validation) {
          if (column.validation.minValue !== undefined && numValue < column.validation.minValue) {
            errors.push({
              columnId: column.id,
              message: t('valueTooSmall', { min: column.validation.minValue }),
              columnName: column.name
            });
          }
          
          if (column.validation.maxValue !== undefined && numValue > column.validation.maxValue) {
            errors.push({
              columnId: column.id,
              message: t('valueTooLarge', { max: column.validation.maxValue }),
              columnName: column.name
            });
          }
        }
      } else if (column.type === 'text' || column.type === 'textarea') {
        const strValue = String(value || '');
        
        if (column.validation) {
          if (column.validation.minLength !== undefined && strValue.length < column.validation.minLength) {
            errors.push({
              columnId: column.id,
              message: t('textTooShort', { min: column.validation.minLength }),
              columnName: column.name
            });
          }
          
          if (column.validation.maxLength !== undefined && strValue.length > column.validation.maxLength) {
            errors.push({
              columnId: column.id,
              message: t('textTooLong', { max: column.validation.maxLength }),
              columnName: column.name
            });
          }
          
          if (column.validation.pattern && !new RegExp(column.validation.pattern).test(strValue)) {
            errors.push({
              columnId: column.id,
              message: column.validation.customMessage || t('invalidFormat'),
              columnName: column.name
            });
          }
        }
      }
    });
    
    return errors.length === 0;
  }, [formData.entries, categoryId, categories, t]);

  return {
    formData,
    updateFormData,
    categories,
    loading: loading || categoriesLoading,
    error,
    selectedCategory,
    saveStatus,
    isDataModified,
    handleSave,
    handleSubmitForApproval: submitForApproval,
    handleEntriesChange,
    loadDataForSchool,
    entries,
    submitting,
    submitForApproval,
    isAutoSaving,
    isSubmitting: submitting,
    isLoading: loading,
    updateValue,
    saveForm: handleSave,
    getErrorForColumn: () => [],
    validation: {
      errors: [],
      isValid: validateForm(),
      validateForm
    }
  };
};
