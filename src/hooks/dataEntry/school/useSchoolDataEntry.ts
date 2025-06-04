import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { CategoryWithColumns } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseSchoolDataEntryOptions {
  categoryId?: string;
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
}

interface SchoolDataEntry {
  id: string;
  column_id: string;
  value: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

/**
 * Hook for School Admin data entry
 * Simplified interface for school administrators to manage data for their own school
 */
export const useSchoolDataEntry = (options: UseSchoolDataEntryOptions = {}) => {
  const { categoryId, autoSave = true, autoSaveInterval = 30000 } = options;
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  
  // State management
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [category, setCategory] = useState<CategoryWithColumns | null>(null);
  const [entries, setEntries] = useState<SchoolDataEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Ensure user is school admin with school assignment
  const schoolId = user?.school_id;
  const isSchoolAdmin = user?.role === 'schooladmin';

  // Load category data
  const loadCategory = useCallback(async () => {
    if (!categoryId) return;
    
    setIsLoading(true);
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select(`
          *,
          columns:columns(*)
        `)
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;
      
      setCategory(categoryData as CategoryWithColumns);
    } catch (error: any) {
      console.error('Error loading category:', error);
      toast({
        title: t('error'),
        description: t('errorLoadingCategory'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, t, toast]);

  // Load existing data entries
  const loadEntries = useCallback(async () => {
    if (!schoolId || !categoryId) return;
    
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (error) throw error;

      const typedEntries = data?.map(entry => ({
        id: entry.id,
        column_id: entry.column_id,
        value: entry.value || '',
        status: entry.status as 'draft' | 'pending' | 'approved' | 'rejected',
        created_at: entry.created_at,
        updated_at: entry.updated_at
      })) || [];

      setEntries(typedEntries);

      // Populate form data
      const formDataMap: Record<string, any> = {};
      typedEntries.forEach(entry => {
        formDataMap[entry.column_id] = entry.value;
      });
      setFormData(formDataMap);
      setHasUnsavedChanges(false);

    } catch (error: any) {
      console.error('Error loading entries:', error);
      toast({
        title: t('error'),
        description: t('errorLoadingData'),
        variant: 'destructive'
      });
    }
  }, [schoolId, categoryId, t, toast]);

  // Handle form data changes
  const updateFormData = useCallback((columnId: string, value: any) => {
    setFormData(prev => ({ ...prev, [columnId]: value }));
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[columnId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnId];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Validation
  const validateForm = useCallback(() => {
    if (!category) return false;
    
    const errors: Record<string, string> = {};
    
    category.columns?.forEach(column => {
      if (column.is_required) {
        const value = formData[column.id];
        if (!value || String(value).trim() === '') {
          errors[column.id] = t('fieldRequired');
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [category, formData, t]);

  // Save as draft
  const saveAsDraft = useCallback(async () => {
    if (!schoolId || !categoryId || !category) return;

    setIsSaving(true);
    try {
      const entriesToSave = category.columns?.map(column => ({
        school_id: schoolId,
        category_id: categoryId,
        column_id: column.id,
        value: formData[column.id] || '',
        status: 'draft' as const,
        created_by: user?.id
      })).filter(entry => entry.value !== '') || [];

      if (entriesToSave.length > 0) {
        const { error } = await supabase
          .from('data_entries')
          .upsert(entriesToSave, {
            onConflict: 'school_id,category_id,column_id'
          });

        if (error) throw error;

        setHasUnsavedChanges(false);
        toast({
          title: t('success'),
          description: t('dataSavedAsDraft')
        });
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast({
        title: t('error'),
        description: t('errorSavingData'),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [schoolId, categoryId, category, formData, user?.id, t, toast]);

  // Submit for approval
  const submitForApproval = useCallback(async () => {
    if (!schoolId || !categoryId || !category) return;
    
    if (!validateForm()) {
      toast({
        title: t('validationError'),
        description: t('pleaseFixErrors'),
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const entriesToSave = category.columns?.map(column => ({
        school_id: schoolId,
        category_id: categoryId,
        column_id: column.id,
        value: formData[column.id] || '',
        status: 'pending' as const,
        created_by: user?.id
      })) || [];

      const { error } = await supabase
        .from('data_entries')
        .upsert(entriesToSave, {
          onConflict: 'school_id,category_id,column_id'
        });

      if (error) throw error;

      setHasUnsavedChanges(false);
      await loadEntries(); // Reload to get updated status
      
      toast({
        title: t('success'),
        description: t('dataSubmittedForApproval')
      });
    } catch (error: any) {
      console.error('Error submitting for approval:', error);
      toast({
        title: t('error'),
        description: t('errorSubmittingData'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [schoolId, categoryId, category, formData, user?.id, validateForm, loadEntries, t, toast]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || isSaving) return;

    const timer = setTimeout(() => {
      saveAsDraft();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [autoSave, hasUnsavedChanges, isSaving, autoSaveInterval, saveAsDraft]);

  // Load data when category or school changes
  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId, loadCategory]);

  useEffect(() => {
    if (schoolId && categoryId) {
      loadEntries();
    }
  }, [schoolId, categoryId, loadEntries]);

  // Get form completion status
  const getCompletionStatus = useCallback(() => {
    if (!category?.columns) return { completed: 0, total: 0, percentage: 0 };
    
    const requiredColumns = category.columns.filter(col => col.is_required);
    const completedFields = requiredColumns.filter(col => {
      const value = formData[col.id];
      return value && String(value).trim() !== '';
    });
    
    return {
      completed: completedFields.length,
      total: requiredColumns.length,
      percentage: Math.round((completedFields.length / requiredColumns.length) * 100) || 0
    };
  }, [category, formData]);

  // Check if form can be submitted
  const canSubmit = useCallback(() => {
    const completion = getCompletionStatus();
    return completion.percentage === 100 && Object.keys(validationErrors).length === 0;
  }, [getCompletionStatus, validationErrors]);

  return {
    // State
    formData,
    category,
    entries,
    isLoading,
    isSaving,
    isSubmitting,
    hasUnsavedChanges,
    validationErrors,
    
    // School info
    schoolId,
    isSchoolAdmin,
    
    // Actions
    updateFormData,
    saveAsDraft,
    submitForApproval,
    validateForm,
    
    // Status
    completionStatus: getCompletionStatus(),
    canSubmit: canSubmit(),
    
    // Utils
    reload: () => {
      loadCategory();
      loadEntries();
    }
  };
};

export default useSchoolDataEntry;