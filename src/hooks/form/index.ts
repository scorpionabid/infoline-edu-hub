
export * from './useFormState';
export * from './useFormActions';
export * from './useFormInitialization';
export * from './useAutoSave';

// Əlavə funksiyaları ixrac et
import { useFormState } from './useFormState';
import { useFormActions } from './useFormActions';
import { useFormInitialization } from './useFormInitialization';
import { useAutoSave } from './useAutoSave';

// Birləşdirilmiş Form hook'u
export const useForm = (initialData: any = {}) => {
  const formState = useFormState(initialData?.categories || []);
  const formActions = useFormActions(formState);
  const formInit = useFormInitialization(formState, formActions);
  const autoSave = useAutoSave(formState, formActions);

  return {
    ...formState,
    ...formActions,
    ...formInit,
    ...autoSave
  };
};
