
import { useState, useEffect } from 'react';
import { DataEntryForm } from '@/types/dataEntry';

export const useForm = (initialForm?: DataEntryForm) => {
  const [form, setForm] = useState<DataEntryForm>(initialForm || {
    entries: {},
    status: 'draft',
    categoryId: '',
    schoolId: '',
    isModified: false
  });

  // Helper functions for the form
  const updateField = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      entries: {
        ...(prev.entries || {}),
        [field]: value
      },
      isModified: true
    }));
  };

  const resetForm = () => {
    setForm({
      entries: {},
      status: 'draft',
      categoryId: form.categoryId || '',
      schoolId: form.schoolId || '',
      isModified: false
    });
  };

  const setFormData = (data: DataEntryForm) => {
    setForm({
      ...data,
      isModified: false
    });
  };

  return {
    form,
    updateField,
    resetForm,
    setFormData
  };
};

export const useSubmitForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const submitForm = async (form: DataEntryForm) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // This would be an API call in the real implementation
      console.log('Submitting form:', form);
      await new Promise(r => setTimeout(r, 1000)); // Simulate API delay
      return true;
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while submitting the form');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    submitError,
    submitForm
  };
};

export const useFormValidation = (form: DataEntryForm) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    // Perform validation here
    
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [form]);
  
  return {
    errors,
    isValid
  };
};
