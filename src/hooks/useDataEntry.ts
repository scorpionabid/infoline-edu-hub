
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCategoryData } from './dataEntry/useCategoryData';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useFormState } from './form/useFormState';
import { useFormActions } from './form/useFormActions';
import { useFormInitialization } from './form/useFormInitialization';
import { DataEntryForm, EntryValue, DataEntrySaveStatus, UseDataEntryProps, UseDataEntryResult, CategoryWithColumns } from '@/types/dataEntry';

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
  const { categories: fetchedCategories, loading: categoriesLoading } = useCategoryData();
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
        .eq('school_id', schoolId);
      
      if (entriesError) {
        throw entriesError;
      }
      
      // Convert the entries from DB format to app format
      const convertedEntries: EntryValue[] = (entriesData || []).map(entry => ({
        id: entry.id,
        categoryId: entry.category_id,
        columnId: entry.column_id,
        value: entry.value,
        status: entry.status as 'pending' | 'approved' | 'rejected'
      }));
      
      // Set entries
      setEntries(convertedEntries);
      
      // Update form data
      updateFormData({
        schoolId,
        entries: convertedEntries
      });
      
      // If no existing entries, initialize empty form
      if (convertedEntries.length === 0 && categories.length > 0) {
        // Find active category (first one if categoryId not provided)
        const targetCategory = categoryId 
          ? categories.find(cat => cat.id === categoryId) 
          : categories[0];
        
        if (targetCategory) {
          const initialEntries = targetCategory.columns.map(column => ({
            categoryId: targetCategory.id,
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
      // For each entry, insert or update in the database
      for (const entry of formData.entries) {
        const { categoryId, columnId, value } = entry;
        
        if (!categoryId || !columnId) continue;
        
        // Check if entry already exists
        const { data: existingEntry } = await supabase
          .from('data_entries')
          .select('id')
          .eq('school_id', schoolId)
          .eq('category_id', categoryId)
          .eq('column_id', columnId)
          .maybeSingle();
        
        if (existingEntry) {
          // Update existing entry
          await supabase
            .from('data_entries')
            .update({
              value: String(value),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEntry.id);
        } else {
          // Insert new entry
          await supabase
            .from('data_entries')
            .insert({
              school_id: schoolId,
              category_id: categoryId,
              column_id: columnId,
              value: String(value),
              status: 'pending',
              created_by: user.id,
              updated_at: new Date().toISOString()
            });
        }
      }
      
      updateFormData({
        lastSaved: new Date().toISOString()
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
  }, [formData.entries, schoolId, t, updateFormData, user?.id]);
  
  // Submit form for approval
  const submitForApproval = useCallback(() => {
    setSubmitting(true);
    
    handleSave()
      .then(() => {
        updateFormData({
          status: 'pending'
        });
        
        toast.success(t('dataSubmittedForApproval'));
        
        if (onComplete) {
          onComplete();
        }
      })
      .catch(error => {
        console.error('Təsdiq üçün göndərilən zaman xəta:', error);
        toast.error(t('errorSubmittingData'));
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [handleSave, onComplete, t, updateFormData]);
  
  // Handle submit for approval
  const handleSubmitForApproval = useCallback(async () => {
    await handleSave();
    submitForApproval();
    return Promise.resolve();
  }, [handleSave, submitForApproval]);

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
    handleSubmitForApproval,
    handleEntriesChange,
    loadDataForSchool,
    entries,
    submitting,
    submitForApproval
  };
};
