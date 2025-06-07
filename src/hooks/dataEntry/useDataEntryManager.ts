
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataEntry, DataEntryStatus, DataEntryForm } from '@/types/dataEntry';
import { CategoryWithColumns } from '@/types/category';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useDataLoader } from './common/useDataLoader';
import { useSaveManager } from './common/useSaveManager';
import { useFormManager } from './common/useFormManager';
import { useStatusManager } from './common/useStatusManager';

interface UseDataEntryManagerOptions {
  categoryId?: string;
  schoolId?: string;
  category?: CategoryWithColumns | null;
  enableRealTime?: boolean;
  enableCache?: boolean;
  autoSave?: boolean;
  debounceMs?: number;
}

interface UseDataEntryManagerReturn {
  // Data
  category: CategoryWithColumns | null;
  columns: any[];
  entries: DataEntry[];
  formData: Record<string, any>;
  
  // Status
  isLoading: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  isDataModified: boolean;
  entryStatus: DataEntryStatus;
  error: string | null;
  lastSaved: Date | null;
  
  // Actions
  handleFormDataChange: (data: Record<string, any>) => void;
  handleFieldChange: (fieldId: string, value: any) => void;
  handleSubmit: () => Promise<{ success: boolean; error?: string }>;
  handleSave: () => Promise<{ success: boolean; error?: string }>;
  resetForm: () => void;
  loadData: () => Promise<void>;
}

export const useDataEntryManager = ({
  categoryId,
  schoolId,
  category: initialCategory,
  enableRealTime = true,
  enableCache = true,
  autoSave = false,
  debounceMs = 1000
}: UseDataEntryManagerOptions): UseDataEntryManagerReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Internal state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data loading
  const {
    data: loadedData,
    isLoading: dataLoading,
    loadData,
    error: loadError
  } = useDataLoader({
    categoryId: categoryId || '',
    schoolId: schoolId || '',
    enableCache
  });

  // Form management
  const {
    formData,
    setFormData,
    handleFieldChange,
    resetForm,
    isDataModified
  } = useFormManager({
    initialData: loadedData?.entries || [],
    autoSave,
    debounceMs
  });

  // Save management
  const {
    isSaving,
    lastSaved,
    handleSave: saveData
  } = useSaveManager({
    categoryId: categoryId || '',
    schoolId: schoolId || '',
    onSave: async (data) => {
      if (!categoryId || !schoolId) {
        throw new Error('Missing required parameters');
      }
      
      // Prepare entries for save
      const entries = Object.entries(data).map(([columnId, value]) => ({
        school_id: schoolId,
        category_id: categoryId,
        column_id: columnId,
        value: value?.toString() || '',
        status: 'draft' as DataEntryStatus
      }));

      // Save to database
      const { error } = await supabase
        .from('data_entries')
        .upsert(entries, {
          onConflict: 'school_id,category_id,column_id'
        });

      if (error) {
        throw new Error(error.message);
      }
    }
  });

  // Status management
  const {
    entryStatus,
    statusPermissions
  } = useStatusManager({
    entries: loadedData?.entries || [],
    userRole: user?.role || 'school_admin'
  });

  // Derived data
  const category = useMemo(() => {
    return initialCategory || loadedData?.category || null;
  }, [initialCategory, loadedData?.category]);

  const columns = useMemo(() => {
    return category?.columns || [];
  }, [category]);

  const entries = useMemo(() => {
    return loadedData?.entries || [];
  }, [loadedData?.entries]);

  const isLoading = useMemo(() => {
    return dataLoading && !loadedData;
  }, [dataLoading, loadedData]);

  // Update form data when loaded data changes
  useEffect(() => {
    if (loadedData?.entries) {
      const formDataFromEntries = loadedData.entries.reduce((acc, entry) => {
        acc[entry.column_id] = entry.value;
        return acc;
      }, {} as Record<string, any>);
      
      setFormData(formDataFromEntries);
    }
  }, [loadedData?.entries, setFormData]);

  // Handle form data changes
  const handleFormDataChange = useCallback((data: Record<string, any>) => {
    setFormData(data);
  }, [setFormData]);

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      setError(null);
      await saveData(formData);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['dataEntry', categoryId, schoolId] 
      });
      
      toast.success('Məlumatlar yadda saxlanıldı');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      setError(errorMessage);
      toast.error(`Yadda saxlama xətası: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }, [saveData, formData, queryClient, categoryId, schoolId]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // First save the data
      const saveResult = await handleSave();
      if (!saveResult.success) {
        return saveResult;
      }

      // Then submit for approval
      if (!categoryId || !schoolId) {
        throw new Error('Missing required parameters for submission');
      }

      const { error: submitError } = await supabase
        .from('data_entries')
        .update({ 
          status: 'pending',
          created_by: user?.id 
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (submitError) {
        throw new Error(submitError.message);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: ['dataEntry', categoryId, schoolId] 
      });
      
      toast.success('Məlumatlar təsdiq üçün göndərildi');
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submit failed';
      setError(errorMessage);
      toast.error(`Göndərmə xətası: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSave, categoryId, schoolId, user?.id, queryClient]);

  // Handle errors
  useEffect(() => {
    if (loadError) {
      setError(loadError);
    }
  }, [loadError]);

  return {
    // Data
    category,
    columns,
    entries,
    formData,
    
    // Status
    isLoading,
    isSubmitting,
    isSaving,
    isDataModified,
    entryStatus,
    error,
    lastSaved,
    
    // Actions
    handleFormDataChange,
    handleFieldChange,
    handleSubmit,
    handleSave,
    resetForm,
    loadData
  };
};
