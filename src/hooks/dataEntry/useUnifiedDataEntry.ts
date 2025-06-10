
import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchUnifiedDataEntries, saveUnifiedDataEntries } from '@/services/api/unifiedDataEntry';
import { UnifiedDataEntry as UnifiedDataEntryType } from '@/services/api/unifiedDataEntry';
import { useDebounce } from '@/hooks/common/useDebounce';
import { useColumnsQuery } from '@/hooks/api/columns/useColumnsQuery';
import { Column } from '@/types/column';

export interface UseUnifiedDataEntryOptions {
  categoryId: string;
  entityId: string;
  entityType: 'school' | 'sector';
  initialEntries?: Partial<UnifiedDataEntryType>[];
  autoSaveInterval?: number;
  userId?: string | null;
  onSave?: () => void;
  onSubmit?: () => void;
}

export interface UnifiedDataEntry {
  id: string;
  tempId?: string;
  category_id: string;
  column_id: string;
  value: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  school_id?: string;
  sector_id?: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  deleted_at?: string | null;
}

export const useUnifiedDataEntry = (options: UseUnifiedDataEntryOptions) => {
  const { 
    categoryId, 
    entityId, 
    entityType, 
    initialEntries = [], 
    autoSaveInterval = 3000,
    userId,
    onSave,
    onSubmit
  } = options;
  
  const [entries, setEntries] = useState<UnifiedDataEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch columns for the category
  const { columns = [] } = useColumnsQuery({ categoryId });
  
  const lastEntries = useRef<UnifiedDataEntry[]>(entries);

  const saveData = useCallback(async () => {
    if (!isDirty) return;

    setIsSaving(true);
    setError(null);

    try {
      const entriesToSave = lastEntries.current.filter(entry => entry.column_id && entry.category_id);
      const savedEntries = await saveUnifiedDataEntries(
        entriesToSave,
        categoryId,
        entityId,
        entityType,
        userId
      );

      const processedEntries = savedEntries.map(entry => ({
        ...entry,
        tempId: entry.id || generateTempId()
      }));

      setEntries(processedEntries);
      setIsDirty(false);
      setLastSaved(new Date());
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, entityId, entityType, userId, isDirty, onSave]);

  const debounceSave = useDebounce(saveData, autoSaveInterval);

  useEffect(() => {
    lastEntries.current = entries;
  }, [entries]);

  useEffect(() => {
    if (autoSave && isDirty) {
      debounceSave();
    }
  }, [autoSave, isDirty, debounceSave]);

  // Convert entries to formData format
  useEffect(() => {
    const newFormData: Record<string, any> = {};
    entries.forEach(entry => {
      if (entry.column_id) {
        newFormData[entry.column_id] = entry.value;
      }
    });
    setFormData(newFormData);
  }, [entries]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEntries = await fetchUnifiedDataEntries({ categoryId, entityId, entityType });
      const processedEntries = fetchedEntries.map(entry => ({
        ...entry,
        tempId: entry.id || generateTempId()
      }));
      setEntries(processedEntries);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, entityId, entityType]);

  const submitEntries = useCallback(async () => {
    if (!isDirty) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const entriesToSave = entries.filter(entry => entry.column_id && entry.category_id);
      await saveUnifiedDataEntries(
        entriesToSave,
        categoryId,
        entityId,
        entityType,
        userId
      );

      setIsDirty(false);
      setLastSaved(new Date());
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [categoryId, entityId, entityType, userId, entries, isDirty, onSubmit]);

  const clearEntries = useCallback(() => {
    setEntries([]);
    setIsDirty(true);
  }, []);

  const addEntry = useCallback(() => {
    const newEntry: UnifiedDataEntry = {
      id: generateTempId(),
      tempId: generateTempId(),
      category_id: categoryId,
      column_id: '',
      value: null,
      status: 'draft',
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEntries(prevEntries => [...prevEntries, newEntry]);
    setIsDirty(true);
  }, [categoryId, userId]);

  const updateEntry = useCallback((tempId: string, newData: Partial<Omit<UnifiedDataEntry, 'tempId'>>) => {
    setEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.tempId === tempId ? { ...entry, ...newData, updated_at: new Date().toISOString() } : entry
      )
    );
    setIsDirty(true);
  }, []);

  const removeEntry = useCallback((tempId: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.tempId !== tempId));
    setIsDirty(true);
  }, []);

  const setEntriesWithTempIds = useCallback((newEntries: Partial<UnifiedDataEntryType>[]) => {
    const processedEntries = newEntries.map(entry => ({
      id: entry.id || generateTempId(),
      tempId: entry.id || generateTempId(),
      category_id: entry.category_id || categoryId,
      column_id: entry.column_id || '',
      value: entry.value || null,
      status: entry.status || 'draft',
      created_by: entry.created_by || userId,
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: entry.updated_at || new Date().toISOString(),
      school_id: entry.school_id,
      sector_id: entry.sector_id,
      approved_by: entry.approved_by,
      approved_at: entry.approved_at,
      rejected_by: entry.rejected_by,
      rejected_at: entry.rejected_at,
      rejection_reason: entry.rejection_reason,
      deleted_at: entry.deleted_at
    }));
    setEntries(processedEntries);
    setIsDirty(true);
  }, [categoryId, userId]);

  const validateForm = useCallback(() => {
    if (!entries || entries.length === 0) {
      return { isValid: false, errors: ['No entries to validate'] };
    }

    const newErrors: Record<string, string> = {};
    let isValid = true;

    entries.forEach((entry, index) => {
      if (!entry.column_id) {
        newErrors[`entry_${index}_column`] = `Entry ${index + 1}: Column ID is required`;
        isValid = false;
      }
      
      if (!entry.category_id) {
        newErrors[`entry_${index}_category`] = `Entry ${index + 1}: Category ID is required`;
        isValid = false;
      }

      if (entry.value && typeof entry.value === 'string' && entry.value.trim() === '') {
        newErrors[`entry_${index}_value`] = `Entry ${index + 1}: Value cannot be empty`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return { isValid, errors: Object.values(newErrors) };
  }, [entries]);

  // Calculate completion percentage
  const completionPercentage = useCallback(() => {
    if (!columns || columns.length === 0) return 0;
    const requiredColumns = columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 100;
    
    const completedRequired = requiredColumns.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedRequired.length / requiredColumns.length) * 100);
  }, [columns, formData]);

  const isValid = Object.keys(errors).length === 0 && completionPercentage() === 100;

  return {
    // Core data
    entries,
    columns,
    formData,
    
    // State flags
    loading,
    isLoading: loading,
    isSaving,
    isSubmitting,
    error,
    errors,
    isDirty,
    isValid,
    autoSave,
    lastSaved,
    hasUnsavedChanges: isDirty,
    completionPercentage: completionPercentage(),
    
    // Actions
    fetchEntries,
    saveEntries: saveData,
    submitEntries,
    clearEntries,
    addEntry,
    updateEntry,
    removeEntry,
    setEntries: setEntriesWithTempIds,
    validateForm,
    setAutoSave
  };
};

// Helper function to generate a unique temporary ID
function generateTempId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
