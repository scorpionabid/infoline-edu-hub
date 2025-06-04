// Main components
import DataEntryTable from './DataEntryTable';
import SchoolManagement from './SchoolManagement';
import DataEntryForm from './DataEntryForm';

// Core components
export { default as DataEntryFormManager } from './core/DataEntryFormManager';
export { default as DataEntryFormContent } from './core/DataEntryFormContent';

// Status components  
export { default as StatusBadge } from './status/StatusBadge';

// Shared components
export { default as DataEntryFormLoading } from './shared/DataEntryFormLoading';
export { default as DataEntryFormError } from './shared/DataEntryFormError';

// Main exports
export { DataEntryTable };
export { DataEntryForm };
export { default as SchoolManagement } from './SchoolManagement';

// Field components
export { default as FormField } from './components/FormField';
export { default as Field } from './fields/Field';
export { default as FieldRenderer } from './fields/FieldRenderer';

// Utils
export { default as formUtils } from './utils/formUtils';
