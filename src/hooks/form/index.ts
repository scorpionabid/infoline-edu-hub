
import { CategoryWithColumns } from '@/types/column';
import { useFormState } from './useFormState';
import { useFormActions } from './useFormActions';
import { useFormInitialization } from './useFormInitialization';
import { useAutoSave } from './useAutoSave';

/**
 * Forma əməliyyatlarını idarə edən əsas hook
 */
export const useForm = (categories: CategoryWithColumns[]) => {
  // Form state'i
  const {
    formData,
    setFormData,
    isAutoSaving,
    setIsAutoSaving,
    isSubmitting,
    setIsSubmitting
  } = useFormState();
  
  // Form əməliyyatları
  const {
    updateValue,
    saveForm,
    submitForm,
    lastOperationTimeRef
  } = useFormActions({
    formData,
    setFormData,
    setIsAutoSaving,
    setIsSubmitting,
    categories
  });
  
  // Form ilkin məlumatları
  const {
    initializeForm
  } = useFormInitialization({
    setFormData
  });
  
  // Avtomatik saxlama
  const {
    setupAutoSave
  } = useAutoSave({
    formData,
    isAutoSaving,
    setIsAutoSaving,
    lastOperationTimeRef
  });
  
  return {
    formData,
    isAutoSaving,
    isSubmitting,
    setIsSubmitting,
    updateValue,
    saveForm,
    submitForm,
    setupAutoSave,
    initializeForm
  };
};

export * from './useFormState';
export * from './useFormActions';
export * from './useFormInitialization';
export * from './useAutoSave';
