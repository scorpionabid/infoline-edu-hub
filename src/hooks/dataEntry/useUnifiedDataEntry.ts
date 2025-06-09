
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnOption } from '@/types/column';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { transformRawColumnData } from '@/utils/columnOptionsParser';

// Unified Data Entry interface that works for both schools and sectors
export interface UnifiedDataEntry {
  id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_by: string;
  created_at: string;
  updated_at: string;
  // Optional fields for different entity types
  school_id?: string;
  sector_id?: string;
}

export interface UseUnifiedDataEntryOptions {
  categoryId: string;
  entityId: string; // Can be schoolId or sectorId
  entityType: 'school' | 'sector';
  onSave?: (entries: UnifiedDataEntry[]) => void;
  onSubmit?: (entries: UnifiedDataEntry[]) => void;
}

export interface UseUnifiedDataEntryReturn {
  // Data
  entries: UnifiedDataEntry[];
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

export const useUnifiedDataEntry = ({
  categoryId,
  entityId,
  entityType,
  onSave,
  onSubmit
}: UseUnifiedDataEntryOptions): UseUnifiedDataEntryReturn => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const queryClient = useQueryClient();
  
  // Local state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine table name based on entity type
  const tableName = entityType === 'school' ? 'data_entries' : 'sector_data_entries';
  const entityFieldName = entityType === 'school' ? 'school_id' : 'sector_id';

  // Load columns for category
  const { data: rawColumns = [], isLoading: columnsLoading } = useQuery({
    queryKey: ['unified-columns', categoryId],
    queryFn: async () => {
      console.log('🔍 useUnifiedDataEntry - Fetching columns for category:', categoryId);
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .order('order_index');
      
      if (error) throw error;
      
      console.log('📊 useUnifiedDataEntry - Raw columns from DB:', data);
      return data || [];
    },
    enabled: !!categoryId
  });

  // Transform columns using standardized parser
  const columns: Column[] = useMemo(() => {
    console.log('🔄 useUnifiedDataEntry - Transforming raw columns:', rawColumns.length);
    
    const transformedColumns = rawColumns.map(col => {
      const transformed = {
        ...col,
        type: col.type as Column['type'],
        status: (col.status === 'active' || col.status === 'inactive') ? col.status : 'active' as const,
        ...transformRawColumnData(col)
      };
      
      if (col.type === 'select') {
        console.log(`🎯 useUnifiedDataEntry - Select column "${col.name}":`, {
          rawOptions: col.options,
          transformedOptions: transformed.options,
          optionsCount: transformed.options?.length || 0
        });
      }
      
      return transformed;
    });
    
    console.log('✅ useUnifiedDataEntry - Final columns:', transformedColumns);
    return transformedColumns;
  }, [rawColumns]);

  // Load data entries
  const { data: rawEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['dataEntries', tableName, categoryId, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('category_id', categoryId)
        .eq(entityFieldName, entityId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryId && !!entityId
  });

  // Transform entries to unified format
  const entries: UnifiedDataEntry[] = useMemo(() => {
    return rawEntries.map(entry => ({
      ...entry,
      status: ['draft', 'pending', 'approved', 'rejected'].includes(entry.status) 
        ? entry.status as 'draft' | 'pending' | 'approved' | 'rejected'
        : 'draft' as const,
      school_id: entityType === 'school' ? (entry as any).school_id : undefined,
      sector_id: entityType === 'sector' ? (entry as any).sector_id : undefined
    }));
  }, [rawEntries, entityType]);

  // Validate form function
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    columns.forEach(column => {
      if (column.is_required) {
        const value = formData[column.id];
        if (!value || value.toString().trim() === '') {
          newErrors[column.id] = `${column.name} is required`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [columns, formData]);

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

  // Save entries mutation
  const saveEntriesMutation = useMutation({
    mutationFn: async (entriesToSave: any[]) => {
      const results = [];
      
      for (const entry of entriesToSave) {
        const existingEntry = entries.find(e => e.column_id === entry.column_id);
        
        if (existingEntry) {
          // Update existing
          const { data, error } = await supabase
            .from(tableName)
            .update({
              value: entry.value?.toString() || '',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEntry.id)
            .select()
            .single();

          if (error) throw error;
          results.push(data);
        } else {
          // Create new - properly structured insert data with safe UUID
          const safeUserId = user?.id && typeof user.id === 'string' && 
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id) 
            ? user.id : null;
          
          const insertData: any = {
            category_id: categoryId,
            column_id: entry.column_id,
            value: entry.value?.toString() || '',
            status: 'draft' as const,
            created_by: safeUserId
          };
          
          console.log('Insert data with safe UUID:', { 
            created_by: safeUserId, 
            user_id: user?.id, 
            is_valid_uuid: safeUserId !== null 
          });
          
          // Add the appropriate entity field
          insertData[entityFieldName] = entityId;
          
          const { data, error } = await supabase
            .from(tableName)
            .insert(insertData)
            .select()
            .single();

          if (error) throw error;
          results.push(data);
        }
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataEntries', tableName, categoryId, entityId] });
      toast.success('Məlumatlar uğurla saxlanıldı');
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Məlumatları saxlamaq mümkün olmadı');
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ entries: entriesToUpdate, status }: { entries: UnifiedDataEntry[]; status: string }) => {
      const entryIds = entriesToUpdate.map(entry => entry.id);
      
      const { error } = await supabase
        .from(tableName)
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .in('id', entryIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataEntries', tableName, categoryId, entityId] });
      toast.success('Status yeniləndi');
    },
    onError: (error) => {
      console.error('Status update error:', error);
      toast.error('Statusu yeniləmək mümkün olmadı');
    }
  });

  // Save entries
  const saveEntries = useCallback(async () => {
    const entriesToSave = Object.entries(formData).map(([columnId, value]) => ({
      column_id: columnId,
      value: value?.toString() || ''
    }));

    await saveEntriesMutation.mutateAsync(entriesToSave);
    
    if (onSave) {
      onSave(entries);
    }
  }, [formData, saveEntriesMutation, onSave, entries]);

  // Submit entries
  const submitEntries = useCallback(async () => {
    const validationResult = validateForm();
    if (!validationResult) {
      return;
    }
    
    // First save, then update status
    await saveEntries();
    
    const entriesToSubmit = entries.filter(entry => entry.status !== 'pending');
    
    if (entriesToSubmit.length > 0) {
      await updateStatusMutation.mutateAsync({
        entries: entriesToSubmit,
        status: 'pending'
      });
    }
    
    if (onSubmit) {
      onSubmit(entriesToSubmit);
    }
  }, [validateForm, saveEntries, entries, updateStatusMutation, onSubmit]);

  // Reset form
  const resetForm = useCallback(() => {
    const initialFormData = entries.reduce((acc, entry) => {
      acc[entry.column_id] = entry.value || '';
      return acc;
    }, {} as Record<string, any>);
    
    setFormData(initialFormData);
    setHasUnsavedChanges(false);
    setErrors({});
  }, [entries]);

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
  const isValid = Object.keys(errors).length === 0;

  return {
    // Data
    entries,
    columns,
    formData,
    
    // Status
    isLoading,
    isSaving: saveEntriesMutation.isPending,
    isSubmitting: updateStatusMutation.isPending,
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
    validateForm
  };
};

export default useUnifiedDataEntry;
