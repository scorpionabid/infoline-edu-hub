import { useState, useCallback } from 'react';
import { DataEntryForm, EntryValue } from '@/types/dataEntry';

// Extend DataEntryForm to include isModified
interface ExtendedDataEntryForm extends DataEntryForm {
  isModified?: boolean;
}

export const useFormLegacy = (initialData?: ExtendedDataEntryForm) => {
  const [form, setForm] = useState<ExtendedDataEntryForm>(
    initialData || {
      categoryId: '',
      schoolId: '',
      entries: [],
      isModified: false
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  
  const setValue = useCallback((columnId: string, value: any) => {
    setForm(prev => {
      const entryIndex = prev.entries.findIndex(e => e.columnId === columnId);
      
      if (entryIndex >= 0) {
        // Update existing entry
        const updatedEntries = [...prev.entries];
        updatedEntries[entryIndex] = {
          ...updatedEntries[entryIndex],
          value
        };
        
        return {
          ...prev,
          entries: updatedEntries,
          isModified: true
        };
      } else {
        // Add new entry
        return {
          ...prev,
          entries: [
            ...prev.entries,
            {
              columnId,
              value
            }
          ],
          isModified: true
        };
      }
    });
    
    // Clear error for this field if any
    if (errors[columnId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnId];
        return newErrors;
      });
    }
  }, [errors]);
  
  const getValue = useCallback((columnId: string) => {
    const entry = form.entries.find(e => e.columnId === columnId);
    return entry ? entry.value : null;
  }, [form.entries]);
  
  const setEntries = useCallback((entries: EntryValue[]) => {
    setForm(prev => ({
      ...prev,
      entries,
      isModified: true
    }));
  }, []);
  
  const reset = useCallback(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        categoryId: '',
        schoolId: '',
        entries: [],
        isModified: false
      });
    }
    setErrors({});
    setWarnings({});
  }, [initialData]);
  
  return {
    form,
    errors,
    warnings,
    setValue,
    getValue,
    setEntries,
    reset,
    setForm,
    setErrors,
    setWarnings
  };
};

export default useFormLegacy;
