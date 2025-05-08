
import { useForm as useReactHookForm } from 'react-hook-form';
import { useFormActions } from './useFormActions';
import { useFormState } from './useFormState';

/**
 * @description Bu hook, form idarəetməsi üçün lazımi metodları və vəziyyətləri təmin edir
 */
export const useForm = (initialCategories = []) => {
  const { formData, setFormData, updateFormData } = useFormState();
  
  // UseFormActions hook-a əsas məlumatları ötürürük
  const formActions = useFormActions({
    entries: formData?.entries || {},
    status: formData?.status || 'draft',
    schoolId: formData?.schoolId || '',
    categoryId: formData?.categoryId || '',
    isModified: false
  });
  
  // React Hook Form 
  const reactHookForm = useReactHookForm();
  
  // Hook-un əsas funksionallığını qaytarırıq
  return {
    ...formActions,
    reactHookForm,
    formData
  };
};

export { useReactHookForm };
