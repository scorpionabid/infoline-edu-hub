import { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * FormAdapter interfeysi - müxtəlif form state idarəetmə sistemləri üçün vahid interfeys
 * Bu, Strategy pattern istifadə edərək fərqli form kitabxanaları ilə işləməyə imkan verir
 */
export interface FormAdapter<T = any> {
  // Form dəyərlərini idarə etmək üçün metodlar
  getValue: (name: string) => any;
  setValue: (name: string, value: any) => void;
  
  // Form vəziyyətini idarə etmək üçün metodlar
  getError: (name: string) => string | undefined;
  isSubmitting: () => boolean;
  
  // Form vəziyyətlərini idarə etmək üçün metodlar
  isDisabled: (disabled?: boolean) => boolean;
  isReadOnly: (readOnly?: boolean) => boolean;
}

/**
 * React Hook Form adapter implementasiyası
 */
export class ReactHookFormAdapter implements FormAdapter {
  private form: UseFormReturn<FieldValues>;
  
  constructor(form: UseFormReturn<FieldValues>) {
    this.form = form;
  }
  
  getValue = (name: string) => {
    return this.form.watch(name);
  }
  
  setValue = (name: string, value: any) => {
    this.form.setValue(name, value);
  }
  
  getError = (name: string) => {
    return this.form.formState.errors[name]?.message as string | undefined;
  }
  
  isSubmitting = () => {
    return this.form.formState.isSubmitting;
  }
  
  isDisabled = (disabled?: boolean) => {
    return !!disabled || this.isSubmitting();
  }
  
  isReadOnly = (readOnly?: boolean) => {
    return !!readOnly;
  }
}

/**
 * Kontrollu komponentlər üçün adapter implementasiyası
 */
export class ControlledAdapter implements FormAdapter {
  private value: Record<string, any>;
  private onChange: (name: string, value: any) => void;
  private errors: Record<string, string>;
  private submitting: boolean;
  
  constructor({
    value = {},
    onChange,
    errors = {},
    submitting = false
  }: {
    value?: Record<string, any>;
    onChange: (name: string, value: any) => void;
    errors?: Record<string, string>;
    submitting?: boolean;
  }) {
    this.value = value;
    this.onChange = onChange;
    this.errors = errors;
    this.submitting = submitting;
  }
  
  getValue = (name: string) => {
    return this.value[name];
  }
  
  setValue = (name: string, value: any) => {
    this.onChange(name, value);
  }
  
  getError = (name: string) => {
    return this.errors[name];
  }
  
  isSubmitting = () => {
    return this.submitting;
  }
  
  isDisabled = (disabled?: boolean) => {
    return !!disabled || this.isSubmitting();
  }
  
  isReadOnly = (readOnly?: boolean) => {
    return !!readOnly;
  }
}

/**
 * Statik (yalnız oxuna bilən) sahələr üçün adapter
 */
export class StaticAdapter implements FormAdapter {
  private value: Record<string, any>;
  
  constructor(value: Record<string, any> = {}) {
    this.value = value;
  }
  
  getValue = (name: string) => {
    return this.value[name];
  }
  
  setValue = () => {
    // Statik adapter dəyişiklik etmir
  }
  
  getError = () => {
    return undefined;
  }
  
  isSubmitting = () => {
    return false;
  }
  
  isDisabled = () => {
    return true;
  }
  
  isReadOnly = () => {
    return true;
  }
}
