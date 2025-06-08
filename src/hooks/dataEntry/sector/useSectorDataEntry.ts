
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType, ColumnOption } from '@/types/column';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useSectorDataEntriesQuery } from '@/hooks/api/sectorDataEntry/useSectorDataEntriesQuery';
import { useSectorValidation } from './useSectorValidation';
import { SectorDataEntry } from '@/services/api/sectorDataEntry';

interface UseSectorDataEntryOptions {
  sectorId: string;
  categoryId: string;
  onSave?: (entries: any[]) => void;
  onSubmit?: (entries: any[]) => void;
}

interface UseSectorDataEntryReturn {
  // Data - Use SectorDataEntry[] instead of DataEntry[]
  entries: SectorDataEntry[];
  columns: Column[];
  formData: Record<string, any>;
  
  // Status
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  completionPercentage: number;
  
  // Validation
  errors: Record<string, string>;
  isValid: boolean;
  
  // Actions
  updateEntry: (columnId: string, value: any) => void;
  saveEntries: () => Promise<void>;
  submitEntries: () => Promise<void>;
  resetForm: () => void;
  validateForm: () => boolean;
}

export const useSectorDataEntry = ({
  sectorId,
  categoryId,
  onSave,
  onSubmit
}: UseSectorDataEntryOptions): UseSectorDataEntryReturn => {
  const user = useAuthStore(selectUser);
  
  // Local state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load columns for category
  const { data: rawColumns = [], isLoading: columnsLoading } = useQuery({
    queryKey: ['columns', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryId
  });

  // Transform columns with proper type casting
  const columns: Column[] = useMemo(() => {
    return rawColumns.map(col => ({
      ...col,
      type: col.type as ColumnType,
      status: (col.status === 'active' || col.status === 'inactive') ? col.status : 'active' as 'active' | 'inactive',
      options: Array.isArray(col.options) ? col.options as ColumnOption[] : [],
      validation: col.validation || {},
      default_value: col.default_value || '',
      help_text: col.help_text || '',
      placeholder: col.placeholder || '',
      is_required: col.is_required || false
    }));
  }, [rawColumns]);

  // Use sector data entries query
  const {
    entries,
    isLoading: entriesLoading,
    saveEntries: saveEntriesMutation,
    updateStatus,
    isSaving: isSavingMutation,
    isUpdatingStatus
  } = useSectorDataEntriesQuery({
    categoryId,
    sectorId,
    enabled: !!sectorId && !!categoryId
  });

  // Validation hook
  const { validateForm, errors, isValid } = useSectorValidation({
    columns,
    entries,
    strictValidation: true
  });

  // Initialize form data from entries
  useEffect(() => {
    if (entries.length > 0) {
      const initialFormData = entries.reduce((acc, entry) => {
        acc[entry.column_id] = entry.value || '';
        return acc;
      }, {} as Record<string, any>);
      
      setFormData(initialFormData);
      setHasUnsavedChanges(false);
    }
  }, [entries]);

  // Update entry value
  const updateEntry = useCallback((columnId: string, value: any) => {
    setFormData(prev => {
      const newFormData = { ...prev, [columnId]: value };
      setHasUnsavedChanges(true);
      return newFormData;
    });
  }, []);

  // Save entries
  const saveEntries = useCallback(async () => {
    const entriesToSave = Object.entries(formData).map(([columnId, value]) => ({
      sector_id: sectorId,
      category_id: categoryId,
      column_id: columnId,
      value: value?.toString() || '',
      status: 'draft',
      created_by: user?.id || ''
    }));

    saveEntriesMutation(entriesToSave);
    setHasUnsavedChanges(false);
    
    if (onSave) {
      onSave(entriesToSave);
    }
  }, [formData, sectorId, categoryId, user?.id, saveEntriesMutation, onSave]);

  // Submit entries
  const submitEntries = useCallback(async () => {
    const validationResult = validateForm(formData);
    if (!validationResult.valid) {
      return;
    }
    
    // First save, then update status
    await saveEntries();
    
    const entriesToSubmit = entries.filter(entry => entry.status !== 'pending');
    
    if (entriesToSubmit.length > 0) {
      updateStatus({
        entries: entriesToSubmit,
        status: 'pending'
      });
    }
    
    if (onSubmit) {
      onSubmit(entriesToSubmit);
    }
  }, [formData, validateForm, saveEntries, entries, updateStatus, onSubmit]);

  // Reset form
  const resetForm = useCallback(() => {
    const initialFormData = entries.reduce((acc, entry) => {
      acc[entry.column_id] = entry.value || '';
      return acc;
    }, {} as Record<string, any>);
    
    setFormData(initialFormData);
    setHasUnsavedChanges(false);
  }, [entries]);

  // Validate form wrapper
  const validateFormWrapper = useCallback(() => {
    const result = validateForm(formData);
    return result.valid;
  }, [formData, validateForm]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (columns.length === 0) return 0;
    
    const filledFields = columns.filter(column => {
      const value = formData[column.id];
      return value !== undefined && value !== null && value !== '';
    }).length;
    
    return Math.round((filledFields / columns.length) * 100);
  }, [columns, formData]);

  // Loading state
  const isLoading = columnsLoading || entriesLoading;

  return {
    // Data - Return SectorDataEntry[] instead of DataEntry[]
    entries,
    columns,
    formData,
    
    // Status
    isLoading,
    isSaving: isSavingMutation,
    isSubmitting: isUpdatingStatus,
    hasUnsavedChanges,
    completionPercentage,
    
    // Validation
    errors,
    isValid,
    
    // Actions
    updateEntry,
    saveEntries,
    submitEntries,
    resetForm,
    validateForm: validateFormWrapper
  };
};

export type { UseSectorDataEntryOptions };
