
import { useState } from 'react';

export interface DataEntryForm {
  entries: Record<string, string>;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  isModified?: boolean;
  schoolId?: string;
  categoryId?: string;
}

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
