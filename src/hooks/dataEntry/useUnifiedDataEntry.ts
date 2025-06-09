import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchUnifiedDataEntries, saveUnifiedDataEntries } from '@/services/api/unifiedDataEntry';
import { UnifiedDataEntry as UnifiedDataEntryType } from '@/services/api/unifiedDataEntry';
import { useDebounce } from '@/hooks/common/useDebounce';

export interface UseUnifiedDataEntryOptions {
  categoryId: string;
  entityId: string;
  entityType: 'school' | 'sector';
  initialEntries?: Partial<UnifiedDataEntryType>[];
  autoSaveInterval?: number;
  userId?: string | null;
}

export interface UnifiedDataEntry extends Omit<UnifiedDataEntryType, 'school_id' | 'sector_id'> {
  tempId?: string;
}

export const useUnifiedDataEntry = (options: UseUnifiedDataEntryOptions) => {
  const { 
    categoryId, 
    entityId, 
    entityType, 
    initialEntries = [], 
    autoSaveInterval = 3000,
    userId
  } = options;
  
  const [entries, setEntries] = useState<UnifiedDataEntry[]>(initialEntries.map(entry => ({ ...entry, tempId: entry.id || generateTempId() })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const debounceSave = useDebounce(saveData, autoSaveInterval);
  const lastEntries = useRef<UnifiedDataEntry[]>(entries);

  useEffect(() => {
    lastEntries.current = entries;
  }, [entries]);

  useEffect(() => {
    if (autoSave && isDirty) {
      debounceSave();
    }
  }, [autoSave, isDirty, debounceSave]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEntries = await fetchUnifiedDataEntries({ categoryId, entityId, entityType });
      setEntries(fetchedEntries.map(entry => ({ ...entry, tempId: entry.id || generateTempId() })));
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, entityId, entityType]);

  const saveData = useCallback(async () => {
    if (!isDirty) return;

    setLoading(true);
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

      setEntries(savedEntries.map(entry => ({ ...entry, tempId: entry.id || generateTempId() })));
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, entityId, entityType, userId, isDirty]);

  const submitEntries = useCallback(async () => {
    if (!isDirty) return;

    setLoading(true);
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
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, entityId, entityType, userId, entries, isDirty]);

  const clearEntries = useCallback(() => {
    setEntries([]);
    setIsDirty(true);
  }, []);

  const addEntry = useCallback(() => {
    const newEntry: UnifiedDataEntry = {
      tempId: generateTempId(),
      category_id: categoryId,
      column_id: '',
      value: null,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setEntries(prevEntries => [...prevEntries, newEntry]);
    setIsDirty(true);
  }, [categoryId]);

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
    setEntries(newEntries.map(entry => ({ ...entry, tempId: entry.id || generateTempId() })));
    setIsDirty(true);
  }, []);

  const validateForm = useCallback(() => {
    if (!entries || entries.length === 0) {
      return { isValid: false, errors: ['No entries to validate'] };
    }

    const errors: string[] = [];
    let isValid = true;

    entries.forEach((entry, index) => {
      if (!entry.column_id) {
        errors.push(`Entry ${index + 1}: Column ID is required`);
        isValid = false;
      }
      
      if (!entry.category_id) {
        errors.push(`Entry ${index + 1}: Category ID is required`);
        isValid = false;
      }

      // Add more validation rules as needed
      if (entry.value && typeof entry.value === 'string' && entry.value.trim() === '') {
        errors.push(`Entry ${index + 1}: Value cannot be empty`);
        isValid = false;
      }
    });

    return { isValid, errors };
  }, [entries]);

  return {
    entries,
    loading,
    error,
    fetchEntries,
    saveEntries,
    clearEntries,
    addEntry,
    updateEntry,
    removeEntry,
    setEntries: setEntriesWithTempIds,
    isDirty,
    autoSave,
    setAutoSave,
    lastSaved,
    hasUnsavedChanges: isDirty,
    validateForm,
    submitEntries
  };
};

// Helper function to generate a unique temporary ID
function generateTempId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
