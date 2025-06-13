import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import { DataEntryService } from '@/services/dataEntry';
import { getDBSafeUUID, isValidUUID } from '@/utils/uuidValidator';

interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  columns?: any[];
}

interface DataEntry {
  id: string;
  category_id: string;
  school_id: string;
  column_id: string;
  value: any;
  status: string;
  created_at: string;
  updated_at: string;
}

type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface UseDataEntryManagerOptions {
  categoryId?: string;
  schoolId?: string;
  userId?: string; // userId parametrini əlavə edirik
  category?: CategoryWithColumns | null;
  enableRealTime?: boolean;
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
  userId, // userId parametrini əlavə edirik
  category: initialCategory,
  enableRealTime = true,
  autoSave = false,
  debounceMs = 1000
}: UseDataEntryManagerOptions): UseDataEntryManagerReturn => {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  
  // Internal state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDataModified, setIsDataModified] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load category data with ONLY ACTIVE columns
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns!inner(
            id,
            name,
            type,
            is_required,
            placeholder,
            help_text,
            order_index,
            default_value,
            options,
            validation,
            status
          )
        `)
        .eq('id', categoryId)
        .eq('columns.status', 'active') // FILTER: Only active columns
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId
  });

  // Load entries data
  const { data: entriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ['dataEntry', categoryId, schoolId],
    queryFn: async () => {
      if (!categoryId || !schoolId) return [];
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryId && !!schoolId
  });

  // Derived data
  const category = useMemo(() => {
    return initialCategory || categoryData || null;
  }, [initialCategory, categoryData]);

  const columns = useMemo(() => {
    return category?.columns || [];
  }, [category]);

  const entries = useMemo(() => {
    return entriesData || [];
  }, [entriesData]);

  const entryStatus = useMemo(() => {
    if (entries.length === 0) return 'draft' as DataEntryStatus;
    const statuses = entries.map(e => e.status);
    if (statuses.some(s => s === 'pending')) return 'pending' as DataEntryStatus;
    if (statuses.some(s => s === 'approved')) return 'approved' as DataEntryStatus;
    if (statuses.some(s => s === 'rejected')) return 'rejected' as DataEntryStatus;
    return 'draft' as DataEntryStatus;
  }, [entries]);

  const isLoading = useMemo(() => {
    return categoryLoading || entriesLoading;
  }, [categoryLoading, entriesLoading]);

  // Update form data when entries change
  useEffect(() => {
    if (entries.length > 0) {
      const formDataFromEntries = entries.reduce((acc, entry) => {
        acc[entry.column_id] = entry.value;
        return acc;
      }, {} as Record<string, any>);
      
      setFormData(formDataFromEntries);
      setIsDataModified(false);
    }
  }, [entries]);

  // Handle form data changes
  const handleFormDataChange = useCallback((data: Record<string, any>) => {
    setFormData(data);
    setIsDataModified(true);
  }, []);

  // Handle field changes
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => {
      const newFormData = { ...prev, [fieldId]: value };
      setIsDataModified(true);
      return newFormData;
    });
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      setError(null);
      setIsSaving(true);
      
      if (!categoryId || !schoolId) {
        throw new Error('Missing required parameters');
      }
      
      // UUID validation - ensure we're sending a valid UUID
      // Prioritize passed userId from props over user?.id from auth
      const effectiveUserId = userId || user?.id;
      
      // Log for debugging
      console.log(`[useDataEntryManager] Using userId: ${effectiveUserId}, from props: ${userId ? 'Yes' : 'No'}, from auth: ${user?.id ? 'Yes' : 'No'}`);
      
      // Log the validation process
      const validatedUserId = getDBSafeUUID(effectiveUserId, 'save_operation');
      console.log(`[useDataEntryManager] UUID validation - original: ${effectiveUserId}, validated: ${validatedUserId}`);
      
      // Mərkəzləşdirilmiş service istifadə et
      const result = await DataEntryService.saveFormData(formData, {
        categoryId,
        schoolId,
        userId: validatedUserId, // Use the validated userId
        status: 'draft'
      });
      
      // Additional logging for debugging
      console.log(`[useDataEntryManager] Save result: ${result.success ? 'Success' : 'Failed'}, count: ${result.savedCount}`);

      if (!result.success) {
        throw new Error(result.error || 'Save failed');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['dataEntry', categoryId, schoolId] 
      });
      
      setIsDataModified(false);
      setLastSaved(new Date());
      toast.success(`Məlumatlar yadda saxlanıldı (${result.savedCount} sahə)`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      setError(errorMessage);
      toast.error(`Yadda saxlama xətası: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [formData, categoryId, schoolId, queryClient, user?.id]);

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

      // Then submit for approval using service
      if (!categoryId || !schoolId) {
        throw new Error('Missing required parameters for submission');
      }

      // UUID validation for submission - prioritize passed userId over user?.id
      const effectiveUserId = userId || user?.id;
      
      // Log for debugging
      console.log(`[useDataEntryManager] Using userId for submission: ${effectiveUserId}, from props: ${userId ? 'Yes' : 'No'}, from auth: ${user?.id ? 'Yes' : 'No'}`);
      
      // Log and validate the userId for submission
      const validatedSubmissionUserId = getDBSafeUUID(effectiveUserId, 'submit_operation');
      console.log(`[useDataEntryManager] Submit UUID validation - original: ${effectiveUserId}, validated: ${validatedSubmissionUserId}`);
      
      const submitResult = await DataEntryService.submitForApproval(
        categoryId,
        schoolId,
        validatedSubmissionUserId // Use the validated userId
      );
      
      // Additional logging for debugging
      console.log(`[useDataEntryManager] Submit result: ${submitResult.success ? 'Success' : 'Failed'}, count: ${submitResult.submittedCount}`);

      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Submit failed');
      }

      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: ['dataEntry', categoryId, schoolId] 
      });
      
      toast.success(`Məlumatlar təsdiq üçün göndərildi (${submitResult.submittedCount} sahə)`);
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submit failed';
      
      // Enhanced error logging
      console.error('[useDataEntryManager] Submit error:', error);
      console.error(`[useDataEntryManager] User ID: ${user?.id || 'undefined'}, Valid UUID: ${user?.id ? isValidUUID(user.id) : false}`);
      console.error(`[useDataEntryManager] Effective User ID: ${effectiveUserId}, Props User ID: ${userId}`);
      
      setError(errorMessage);
      toast.error(`Göndərmə xətası: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSave, categoryId, schoolId, userId, user?.id, queryClient]);

  // Reset form
  const resetForm = useCallback(() => {
    const initialFormData = entries.reduce((acc, entry) => {
      acc[entry.column_id] = entry.value || '';
      return acc;
    }, {} as Record<string, any>);
    
    setFormData(initialFormData);
    setIsDataModified(false);
  }, [entries]);

  // Load data
  const loadData = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['category', categoryId] });
    queryClient.invalidateQueries({ queryKey: ['dataEntry', categoryId, schoolId] });
  }, [queryClient, categoryId, schoolId]);

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
