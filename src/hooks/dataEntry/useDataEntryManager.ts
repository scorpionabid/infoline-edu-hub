
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
  userId?: string;
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
  userId,
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
        .eq('columns.status', 'active')
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
      
      // UUID validation
      const effectiveUserId = userId || user?.id;
      
      console.log(`[useDataEntryManager] handleSave - userId from props: ${userId}`);
      console.log(`[useDataEntryManager] handleSave - user?.id from auth: ${user?.id}`);
      console.log(`[useDataEntryManager] handleSave - effective userId: ${effectiveUserId}`);
      
      const validatedUserId = getDBSafeUUID(effectiveUserId, 'save_operation');
      console.log(`[useDataEntryManager] UUID validation result: ${validatedUserId}`);
      
      // ✅ DÜZƏLTMƏ: Save əməliyyatında status-u 'draft' saxlayırıq
      const result = await DataEntryService.saveFormData(formData, {
        categoryId,
        schoolId,
        userId: validatedUserId,
        status: 'draft' // Save operation keeps draft status
      });
      
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
      console.error(`[useDataEntryManager] Save error details:`, error);
      setError(errorMessage);
      toast.error(`Yadda saxlama xətası: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [formData, categoryId, schoolId, queryClient, user?.id, userId]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // ✅ DÜZƏLTMƏ: Submit əməliyyatından əvvəl məlumatları 'pending' status ilə yaddaşa saxlayırıq
      if (!categoryId || !schoolId) {
        throw new Error('Missing required parameters for submission');
      }

      // UUID validation for submission
      const effectiveUserId = userId || user?.id;
      
      console.log(`[useDataEntryManager] handleSubmit - userId from props: ${userId}`);
      console.log(`[useDataEntryManager] handleSubmit - user?.id from auth: ${user?.id}`);
      console.log(`[useDataEntryManager] handleSubmit - effective userId: ${effectiveUserId}`);
      
      const validatedUserId = getDBSafeUUID(effectiveUserId, 'submit_operation');
      console.log(`[useDataEntryManager] Submit UUID validation result: ${validatedUserId}`);
      
      // ✅ İLK: Məlumatları 'pending' status ilə saxlayırıq
      const saveResult = await DataEntryService.saveFormData(formData, {
        categoryId,
        schoolId,
        userId: validatedUserId,
        status: 'pending' // ✅ KRITIK DÜZƏLTMƏ: Submit zamanı status 'pending' olmalıdır
      });
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save data with pending status');
      }

      console.log(`[useDataEntryManager] Submit save result: ${saveResult.success ? 'Success' : 'Failed'}, count: ${saveResult.savedCount}`);

      // ✅ İKİNCİ: Submission service-i çağırırıq (əlavə təsdiq üçün)
      const submitResult = await DataEntryService.submitForApproval(
        categoryId,
        schoolId,
        validatedUserId
      );
      
      console.log(`[useDataEntryManager] Submit approval result: ${submitResult.success ? 'Success' : 'Failed'}, count: ${submitResult.submittedCount}`);

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
      
      console.error('[useDataEntryManager] Submit error:', error);
      console.error(`[useDataEntryManager] User ID: ${user?.id || 'undefined'}, Valid UUID: ${user?.id ? isValidUUID(user.id) : false}`);
      console.error(`[useDataEntryManager] Effective User ID: ${effectiveUserId}, Props User ID: ${userId}`);
      
      setError(errorMessage);
      toast.error(`Göndərmə xətası: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, categoryId, schoolId, userId, user?.id, queryClient]);

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
