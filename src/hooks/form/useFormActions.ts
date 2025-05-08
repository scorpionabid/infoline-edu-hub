
import { useState } from 'react';
import { DataEntryForm } from '../form';

export function useFormActions(initialForm: DataEntryForm) {
  const [form, setForm] = useState<DataEntryForm>(initialForm);
  
  const updateField = (columnId: string, value: string) => {
    setForm(prev => ({
      ...prev,
      entries: {
        ...prev.entries,
        [columnId]: value
      },
      isModified: true
    }));
  };
  
  const updateStatus = (status: DataEntryForm['status']) => {
    setForm(prev => ({
      ...prev,
      status,
      isModified: true
    }));
  };
  
  const resetForm = () => {
    setForm(initialForm);
  };
  
  return {
    form,
    updateField,
    updateStatus,
    resetForm,
    setForm
  };
}

export default useFormActions;
