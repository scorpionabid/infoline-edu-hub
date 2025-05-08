
import { useState } from 'react';
import { DataEntryForm, EntryValue } from '@/types/dataEntry';

export const useDataEntryForm = (initialForm?: DataEntryForm) => {
  const [form, setForm] = useState<DataEntryForm>(initialForm || {
    categoryId: '',
    schoolId: '',
    entries: [],
    isModified: false
  });

  const updateEntry = (columnId: string, value: any) => {
    setForm(prev => {
      // Find the existing entry
      const existingEntryIndex = prev.entries.findIndex(
        entry => entry.columnId === columnId
      );

      let updatedEntries = [...prev.entries];

      if (existingEntryIndex >= 0) {
        // Update existing entry
        updatedEntries[existingEntryIndex] = {
          ...updatedEntries[existingEntryIndex],
          value
        };
      } else {
        // Add new entry
        updatedEntries.push({
          columnId,
          value
        });
      }

      return {
        ...prev,
        entries: updatedEntries,
        isModified: true
      };
    });
  };

  const resetForm = () => {
    setForm({
      categoryId: '',
      schoolId: '',
      entries: [],
      isModified: false
    });
  };

  const markAsSaved = () => {
    setForm(prev => ({
      ...prev,
      isModified: false
    }));
  };

  return {
    form,
    setForm,
    updateEntry,
    resetForm,
    markAsSaved
  };
};
