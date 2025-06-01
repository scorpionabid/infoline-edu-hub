/**
 * Fields komponentləri üçün mərkəzi ixrac
 * Vahid Field komponenti və müxtəlif adapterlər əlavə edilib
 */

// Əsas Adapter və Field komponentimiz
export { default as Field } from './Field';
export { 
  ReactHookFormAdapter, 
  ControlledAdapter, 
  StaticAdapter 
} from './adapters/FormAdapter';

// TypeScript tipləri üçün export type istifadə edirik
export type { FormAdapter } from './adapters/FormAdapter';

// Geriyə uyğunluq üçün saxlanılan komponentlər
// (bunlar indi Field komponentinə yönləndirilir)
export { default as FieldRenderer } from './FieldRenderer';
export { default as FieldRendererSimple } from './FieldRendererSimple';
export { default as EntryField } from './EntryField';

// Köhnə komponentlər - gələcəkdə silinə bilərlər
export { default as CheckboxField } from './CheckboxField';
export { default as DateField } from './DateField';
export { default as InputField } from './InputField';
export { default as RadioField } from './RadioField';
export { default as SelectField } from './SelectField';
export { default as TextAreaField } from './TextAreaField';
