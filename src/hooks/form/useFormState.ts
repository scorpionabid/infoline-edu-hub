
import { useState } from 'react';
import { DataEntryForm } from '@/types/dataEntry';

/**
 * Forma state'ini idarə edən hook
 */
export const useFormState = (initialFormId: string = "form1", initialSchoolId: string = "school1") => {
  const [formData, setFormData] = useState<DataEntryForm>({
    formId: initialFormId,
    schoolId: initialSchoolId,
    entries: [],
    overallProgress: 0,
    status: 'draft'
  });
  
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  return {
    formData,
    setFormData,
    isAutoSaving,
    setIsAutoSaving,
    isSubmitting,
    setIsSubmitting
  };
};
