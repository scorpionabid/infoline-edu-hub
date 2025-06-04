
import { useState, useCallback, useMemo } from 'react';
import { DataEntry } from '@/types/dataEntry';
import { Column } from '@/types/column';

export interface FormState {
  formData: Record<string, any>;
  isDirty: boolean;
  isModified: boolean;
  lastModified: number;
}

export interface UseDataEntryFormStateProps {
  columns: Column[];
  entries: DataEntry[];
  initialData?: Record<string, any>;
}

/**
 * Data entry form state management hook
 */
export function useDataEntryFormState({
  columns,
  entries,
  initialData = {}
}: UseDataEntryFormStateProps) {
  
  // Initialize form data from entries and initial data
  const initialFormData = useMemo(() => {
    const formData: Record<string, any> = { ...initialData };
    
    // Populate from existing entries
    entries.forEach(entry => {
      if (entry.column_id && entry.value !== undefined) {
        formData[entry.column_id] = entry.value;
      }
    });
    
    // Ensure all columns have at least empty values
    columns.forEach(column => {
      if (!(column.id in formData)) {
        formData[column.id] = column.default_value || '';
      }
    });
    
    return formData;
  }, [columns, entries, initialData]);
  
  const [formData, setFormData] = useState<Record<string, any>>(initialFormData);
  const [isDirty, setIsDirty] = useState(false);
  const [lastModified, setLastModified] = useState(Date.now());
  
  // Update field value
  const updateField = useCallback((fieldId: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldId]: value };
      return newData;
    });
    setIsDirty(true);
    setLastModified(Date.now());
  }, []);
  
  // Update multiple fields
  const updateFields = useCallback((updates: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setLastModified(Date.now());
  }, []);
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setIsDirty(false);
    setLastModified(Date.now());
  }, [initialFormData]);
  
  // Mark as saved (clean)
  const markAsSaved = useCallback(() => {
    setIsDirty(false);
  }, []);
  
  // Get field value
  const getFieldValue = useCallback((fieldId: string) => {
    return formData[fieldId] ?? '';
  }, [formData]);
  
  // Check if field has value
  const hasFieldValue = useCallback((fieldId: string) => {
    const value = formData[fieldId];
    return value !== undefined && value !== null && String(value).trim() !== '';
  }, [formData]);
  
  // Get form as entries array
  const getFormAsEntries = useCallback((categoryId: string, schoolId: string): Partial<DataEntry>[] => {
    return Object.entries(formData)
      .filter(([fieldId, value]) => fieldId && value !== undefined)
      .map(([fieldId, value]) => ({
        column_id: fieldId,
        category_id: categoryId,
        school_id: schoolId,
        value: String(value || ''),
        status: 'draft' as const,
        updated_at: new Date().toISOString()
      }));
  }, [formData]);
  
  const formState: FormState = {
    formData,
    isDirty,
    isModified: isDirty,
    lastModified
  };
  
  return {
    formState,
    formData,
    isDirty,
    lastModified,
    updateField,
    updateFields,
    resetForm,
    markAsSaved,
    getFieldValue,
    hasFieldValue,
    getFormAsEntries
  };
}

export default useDataEntryFormState;
