
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataEntry, DataEntryStatus, DataEntryForm } from '@/types/dataEntry';
import { CategoryWithColumns } from '@/types/category';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UseDataEntryManagerOptions {
  categoryId?: string;
  schoolId?: string;
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
  category: initialCategory,
  enableRealTime = true,
  autoSave = false,
  debounceMs = 1000
}: UseDataEntryManagerOptions): UseDataEntryManagerReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Internal state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDataModified, setIsDataModified] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load category data
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const { data, error } = await supabase
        .from('categories')
        .select('*, columns(*)')
        .eq('id', categoryId)
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
      
      // Prepare entries for save
      const entries = Object.entries(formData).map(([columnId, value]) => ({
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

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['dataEntry', categoryId, schoolId] 
      });
      
      setIsDataModified(false);
      setLastSaved(new Date());
      toast.success('Məlumatlar yadda saxlanıldı');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      setError(errorMessage);
      toast.error(`Yadda saxlama xətası: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [formData, categoryId, schoolId, queryClient]);

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
