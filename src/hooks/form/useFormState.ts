import { useState } from 'react';
import { DataEntryForm } from '@/types/dataEntry';

export const useFormState = () => {
  const [form, setForm] = useState<DataEntryForm>({
    schoolId: '',
    entries: [],
    isSubmitting: false,
    isSubmitted: false,
    errors: {}
  });

  const updateForm = (updates: Partial<DataEntryForm>) => {
    setForm(prevForm => ({
      ...prevForm,
      ...updates
    }));
  };

  return {
    form,
    updateForm,
  };
};
