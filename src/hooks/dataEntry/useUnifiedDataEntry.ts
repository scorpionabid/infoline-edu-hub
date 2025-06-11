
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchUnifiedDataEntries, 
  saveUnifiedDataEntries, 
  UnifiedDataEntry 
} from '@/services/api/unifiedDataEntry';
import { useToast } from '@/hooks/use-toast';
import { Column } from '@/types/column';

export interface UseUnifiedDataEntryOptions {
  categoryId: string;
  entityId: string;
  entityType: 'school' | 'sector';
  userId?: string | null;
  onSave?: (entries: UnifiedDataEntry[]) => void;
  onSubmit?: (entries: UnifiedDataEntry[]) => void;
}

export interface UseUnifiedDataEntryResult {
  // Data
  entries: UnifiedDataEntry[];
  columns: Column[];
  formData: Record<string, any>;
  
  // State
  loading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  completionPercentage: number;
  lastSaved: Date | null;
  
  // Validation
  errors: Record<string, string>;
  isValid: boolean;
  validateForm: () => boolean;
  
  // Actions
  updateEntry: (entryId: string, data: Partial<UnifiedDataEntry>) => void;
  saveEntries: () => Promise<void>;
  submitEntries: () => Promise<void>;
  refreshData: () => void;
}

export const useUnifiedDataEntry = ({
  categoryId,
  entityId,
  entityType,
  userId,
  onSave,
  onSubmit
}: UseUnifiedDataEntryOptions): UseUnifiedDataEntryResult => {
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data entries
  const { 
    data: entries = [], 
    isLoading: loading 
  } = useQuery({
    queryKey: ['unified-data-entries', categoryId, entityId, entityType],
    queryFn: () => fetchUnifiedDataEntries({ categoryId, entityId, entityType }),
    enabled: !!categoryId && !!entityId
  });

  // Mock columns - In real implementation, this would fetch from API
  const columns: Column[] = [
    {
      id: '1',
      name: 'Sahə 1',
      type: 'text',
      is_required: true,
      category_id: categoryId,
      order_index: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2', 
      name: 'Sahə 2',
      type: 'number',
      is_required: false,
      category_id: categoryId,
      order_index: 2,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: Partial<UnifiedDataEntry>[]) => 
      saveUnifiedDataEntries(data, categoryId, entityId, entityType, userId),
    onSuccess: (savedEntries) => {
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      queryClient.invalidateQueries({ 
        queryKey: ['unified-data-entries', categoryId, entityId, entityType] 
      });
      onSave?.(savedEntries);
      toast({
        title: 'Uğurlu',
        description: 'Məlumatlar saxlanıldı'
      });
    },
    onError: (error) => {
      toast({
        title: 'Xəta',
        description: 'Saxlama zamanı xəta baş verdi',
        variant: 'destructive'
      });
    }
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: Partial<UnifiedDataEntry>[]) => {
      // First save, then update status
      const savedEntries = await saveUnifiedDataEntries(
        data, 
        categoryId, 
        entityId, 
        entityType, 
        userId
      );
      
      // Update status to pending
      const pendingEntries = savedEntries.map(entry => ({
        ...entry,
        status: 'pending' as const
      }));
      
      return saveUnifiedDataEntries(
        pendingEntries,
        categoryId,
        entityId,
        entityType,
        userId
      );
    },
    onSuccess: (submittedEntries) => {
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      queryClient.invalidateQueries({ 
        queryKey: ['unified-data-entries', categoryId, entityId, entityType] 
      });
      onSubmit?.(submittedEntries);
      toast({
        title: 'Uğurlu',
        description: 'Məlumatlar təsdiq üçün göndərildi'
      });
    },
    onError: (error) => {
      toast({
        title: 'Xəta', 
        description: 'Göndərmə zamanı xəta baş verdi',
        variant: 'destructive'
      });
    }
  });

  // Update form data when entries change
  useEffect(() => {
    const newFormData: Record<string, any> = {};
    entries.forEach(entry => {
      if (entry.column_id) {
        newFormData[entry.column_id] = entry.value;
      }
    });
    setFormData(newFormData);
  }, [entries]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const requiredColumns = columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 100;
    
    const completedRequired = requiredColumns.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedRequired.length / requiredColumns.length) * 100);
  }, [columns, formData]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    columns.forEach(column => {
      if (column.is_required) {
        const value = formData[column.id];
        if (!value || value.toString().trim() === '') {
          newErrors[column.id] = `${column.name} sahəsi məcburidir`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [columns, formData]);

  // Update errors when formData changes
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    columns.forEach(column => {
      if (column.is_required) {
        const value = formData[column.id];
        if (!value || value.toString().trim() === '') {
          newErrors[column.id] = `${column.name} sahəsi məcburidir`;
        }
      }
    });
    
    setErrors(newErrors);
  }, [columns, formData]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Update entry
  const updateEntry = useCallback((entryId: string, data: Partial<UnifiedDataEntry>) => {
    if (data.value !== undefined && data.column_id) {
      setFormData(prev => ({
        ...prev,
        [data.column_id!]: data.value
      }));
      setHasUnsavedChanges(true);
    }
  }, []);

  // Save entries
  const saveEntries = useCallback(async () => {
    const entriesToSave = Object.entries(formData).map(([columnId, value]) => ({
      column_id: columnId,
      category_id: categoryId,
      value: value,
      status: 'draft' as const
    }));
    
    await saveMutation.mutateAsync(entriesToSave);
  }, [formData, categoryId, saveMutation]);

  // Submit entries
  const submitEntries = useCallback(async () => {
    if (!validateForm()) return;
    
    const entriesToSubmit = Object.entries(formData).map(([columnId, value]) => ({
      column_id: columnId,
      category_id: categoryId,
      value: value,
      status: 'draft' as const
    }));
    
    await submitMutation.mutateAsync(entriesToSubmit);
  }, [formData, categoryId, validateForm, submitMutation]);

  // Refresh data
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['unified-data-entries', categoryId, entityId, entityType] 
    });
  }, [queryClient, categoryId, entityId, entityType]);

  return {
    // Data
    entries,
    columns,
    formData,
    
    // State
    loading,
    isSaving: saveMutation.isPending,
    isSubmitting: submitMutation.isPending,
    hasUnsavedChanges,
    completionPercentage,
    lastSaved,
    
    // Validation
    errors,
    isValid,
    validateForm,
    
    // Actions
    updateEntry,
    saveEntries,
    submitEntries,
    refreshData
  };
};

export default useUnifiedDataEntry;
