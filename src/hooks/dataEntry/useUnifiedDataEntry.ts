
import React, { useState, useCallback } from 'react';
import { 
  fetchUnifiedDataEntries, 
  saveUnifiedDataEntries, 
  updateUnifiedDataEntriesStatus,
  type UnifiedDataEntry
} from '@/services/api/unifiedDataEntry';
import { toast } from 'sonner';

export interface UseUnifiedDataEntryOptions {
  categoryId: string;
  entityId: string;
  entityType: 'school' | 'sector';
  userId?: string | null;
  onSave?: () => void;
  onSubmit?: () => void;
}

export const useUnifiedDataEntry = ({
  categoryId,
  entityId,
  entityType,
  userId,
  onSave,
  onSubmit
}: UseUnifiedDataEntryOptions) => {
  const [entries, setEntries] = useState<UnifiedDataEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Additional state for enhanced form functionality
  const [columns, setColumns] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUnifiedDataEntries({
        categoryId,
        entityId,
        entityType
      });
      setEntries(data);
      
      // Initialize form data from entries
      const initialFormData: Record<string, any> = {};
      data.forEach(entry => {
        initialFormData[entry.column_id] = entry.value;
      });
      setFormData(initialFormData);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, entityId, entityType]);

  const saveEntries = useCallback(async (entriesToSave?: Partial<UnifiedDataEntry>[]) => {
    setIsSaving(true);
    setError(null);
    try {
      const dataToSave = entriesToSave || Object.entries(formData).map(([columnId, value]) => ({
        column_id: columnId,
        value: String(value || '')
      }));
      
      const savedEntries = await saveUnifiedDataEntries(
        dataToSave,
        categoryId,
        entityId,
        entityType,
        userId
      );
      
      // Update local state
      setEntries(prev => {
        const newEntries = [...prev];
        savedEntries.forEach(saved => {
          const index = newEntries.findIndex(e => e.id === saved.id);
          if (index >= 0) {
            newEntries[index] = saved;
          } else {
            newEntries.push(saved);
          }
        });
        return newEntries;
      });
      
      setHasUnsavedChanges(false);
      toast.success('Entries saved successfully');
      
      if (onSave) {
        onSave();
      }
      
      return savedEntries;
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to save entries');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, entityId, entityType, userId, formData, onSave]);

  const submitEntries = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // First save current changes
      const savedEntries = await saveEntries();
      
      // Then update status to submitted
      await updateUnifiedDataEntriesStatus(savedEntries, 'pending', entityType);
      
      // Update local state
      setEntries(prev => prev.map(entry => ({ ...entry, status: 'pending' as any })));
      
      toast.success('Entries submitted for approval');
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to submit entries');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [saveEntries, entityType, onSubmit]);

  const updateStatus = useCallback(async (entriesToUpdate: UnifiedDataEntry[], status: string) => {
    setLoading(true);
    setError(null);
    try {
      await updateUnifiedDataEntriesStatus(entriesToUpdate, status, entityType);
      
      // Update local state
      setEntries(prev => prev.map(entry => {
        if (entriesToUpdate.some(e => e.id === entry.id)) {
          return { ...entry, status: status as any };
        }
        return entry;
      }));
      
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to update status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  const updateEntry = useCallback((columnId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [columnId]: value
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    const requiredColumns = columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 100;
    
    const completedRequired = requiredColumns.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedRequired.length / requiredColumns.length) * 100);
  }, [columns, formData]);

  // Validate form
  const isValid = React.useMemo(() => {
    const requiredColumns = columns.filter(col => col.is_required);
    return requiredColumns.every(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
  }, [columns, formData]);

  return {
    entries,
    loading: loading || isSaving || isSubmitting,
    error,
    fetchEntries,
    saveEntries,
    updateStatus,
    refetch: fetchEntries,
    
    // Enhanced form functionality
    columns,
    formData,
    isLoading: loading,
    isSaving,
    isSubmitting,
    hasUnsavedChanges,
    completionPercentage,
    errors,
    isValid,
    updateEntry,
    submitEntries
  };
};

export { type UnifiedDataEntry };
