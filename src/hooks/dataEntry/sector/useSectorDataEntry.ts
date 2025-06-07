
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { Column, ColumnType, ColumnOption } from '@/types/column';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useSectorValidation } from './useSectorValidation';
import { toast } from 'sonner';

interface UseSectorDataEntryOptions {
  sectorId: string;
  categoryId: string;
  onSave?: (entries: DataEntry[]) => void;
  onSubmit?: (entries: DataEntry[]) => void;
}

interface UseSectorDataEntryReturn {
  // Data
  entries: DataEntry[];
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
  const queryClient = useQueryClient();
  
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

  // Load existing entries
  const { data: rawEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['sectorDataEntries', sectorId, categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sector_data_entries')
        .select('*')
        .eq('sector_id', sectorId)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sectorId && !!categoryId
  });

  // Transform entries to match DataEntry interface
  const entries: DataEntry[] = useMemo(() => {
    return rawEntries.map(entry => ({
      id: entry.id,
      school_id: sectorId, // Use sector_id as school_id for compatibility
      category_id: entry.category_id,
      column_id: entry.column_id,
      value: entry.value,
      status: entry.status as DataEntryStatus,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      created_by: entry.created_by,
      approved_by: entry.approved_by,
      approved_at: entry.approved_at,
      rejected_by: entry.rejected_by,
      rejected_at: entry.rejected_at,
      rejection_reason: entry.rejection_reason
    }));
  }, [rawEntries, sectorId]);

  // Validation hook
  const { validateForm, errors, isValid } = useSectorValidation({
    columns,
    entries,
    strictValidation: true
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (entriesToSave: any[]) => {
      const { error } = await supabase
        .from('sector_data_entries')
        .upsert(entriesToSave, {
          onConflict: 'sector_id,category_id,column_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({
        queryKey: ['sectorDataEntries', sectorId, categoryId]
      });
      toast.success('Məlumatlar yadda saxlanıldı');
      if (onSave) {
        onSave(entries);
      }
    },
    onError: (error: any) => {
      toast.error(`Yadda saxlama xətası: ${error.message}`);
    }
  });

  // Submit mutation  
  const submitMutation = useMutation({
    mutationFn: async () => {
      // First save all entries
      const entriesToSubmit = Object.entries(formData).map(([columnId, value]) => ({
        id: crypto.randomUUID(),
        sector_id: sectorId,
        category_id: categoryId,
        column_id: columnId,
        value: value?.toString() || '',
        status: 'pending' as DataEntryStatus,
        created_by: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Save and then update status
      const { error: saveError } = await supabase
        .from('sector_data_entries')
        .upsert(entriesToSubmit, {
          onConflict: 'sector_id,category_id,column_id'
        });
      
      if (saveError) throw saveError;

      // Convert to DataEntry format for callback
      const convertedEntries: DataEntry[] = entriesToSubmit.map(entry => ({
        ...entry,
        school_id: sectorId
      }));

      return convertedEntries;
    },
    onSuccess: (submittedEntries) => {
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({
        queryKey: ['sectorDataEntries', sectorId, categoryId]
      });
      toast.success('Məlumatlar təsdiq üçün göndərildi');
      if (onSubmit) {
        onSubmit(submittedEntries);
      }
    },
    onError: (error: any) => {
      toast.error(`Göndərmə xətası: ${error.message}`);
    }
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
      status: 'draft' as DataEntryStatus,
      created_by: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    await saveMutation.mutateAsync(entriesToSave);
  }, [formData, sectorId, categoryId, user?.id, saveMutation]);

  // Submit entries
  const submitEntries = useCallback(async () => {
    const validationResult = validateForm(formData);
    if (!validationResult.valid) {
      toast.error('Formu göndərməzdən əvvəl xətaları düzəldin');
      return;
    }
    
    await submitMutation.mutateAsync();
  }, [formData, validateForm, submitMutation]);

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
    // Data
    entries,
    columns,
    formData,
    
    // Status
    isLoading,
    isSaving: saveMutation.isPending,
    isSubmitting: submitMutation.isPending,
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
