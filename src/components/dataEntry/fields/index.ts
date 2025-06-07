// Main unified field renderer (PRIMARY)
export { default as UnifiedFieldRenderer } from './UnifiedFieldRenderer';

// Form field components (consolidated from components/)
export { default as FormField } from './FormField';  // Moved from components/
export { default as FormFieldHelp } from './FormFieldHelp';  // Moved from components/

// Input components (consolidated from inputs/)  
export { default as TextInput } from './TextInput';  // Moved from inputs/
export { default as NumberInput } from './NumberInput';  // Moved from inputs/
export { default as DateInput } from './DateInput';  // Moved from inputs/
export { default as SelectInput } from './SelectInput';  // Moved from inputs/
export { default as CheckboxInput } from './CheckboxInput';  // Moved from inputs/
export { default as TextAreaInput } from './TextAreaInput';  // Moved from inputs/

// Alert components (consolidated from components/)
export { default as ApprovalAlert } from './ApprovalAlert';  // Moved from components/
export { default as RejectionAlert } from './RejectionAlert';  // Moved from components/
export { default as CategoryHeader } from './CategoryHeader';  // Moved from components/

// Advanced field components (keep only essential ones)
export { default as CheckboxField } from './CheckboxField';
export { default as RadioField } from './RadioField';

// Types
export type { UnifiedFieldRendererProps } from './UnifiedFieldRenderer';

// Note: Removed deprecated components (DELETED_* files):
// - Field.tsx, BaseField.tsx (replaced by UnifiedFieldRenderer)
// - TextInputField.tsx, SelectField.tsx, NumberField.tsx, DateField.tsx, TextAreaField.tsx (replaced by Input components)
// - adapters/ folder (over-engineering, removed)
