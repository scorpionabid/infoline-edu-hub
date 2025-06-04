
import { UseFormReturn } from 'react-hook-form';

/**
 * Form Adapter - React Hook Form ilə Field komponentləri arasında adapter
 */
export class FormAdapter {
  private form: UseFormReturn<any>;
  private readOnly: boolean;
  private disabled: boolean;

  constructor(form: UseFormReturn<any>, readOnly = false, disabled = false) {
    this.form = form;
    this.readOnly = readOnly;
    this.disabled = disabled;
  }

  getValue(fieldName: string) {
    return this.form.getValues(fieldName);
  }

  setValue(fieldName: string, value: any) {
    if (!this.readOnly && !this.disabled) {
      this.form.setValue(fieldName, value);
    }
  }

  getError(fieldName: string) {
    return this.form.formState.errors[fieldName];
  }

  isReadOnly() {
    return this.readOnly;
  }

  isDisabled() {
    return this.disabled;
  }

  registerField(fieldName: string) {
    return this.form.register(fieldName);
  }

  triggerValidation(fieldName?: string) {
    if (fieldName) {
      return this.form.trigger(fieldName);
    }
    return this.form.trigger();
  }

  watch(fieldName?: string) {
    return this.form.watch(fieldName);
  }
}
