
// Main components
import DataEntryTable from './DataEntryTable';
import SchoolManagement from './SchoolManagement';

// Core components (unified)
export { default as DataEntryFormManager } from './core/DataEntryFormManager';
export { default as DataEntryFormContent } from './core/DataEntryFormContent';
export { default as FormFields } from './core/FormFields';

// Unified components (NEW - primary interfaces)
export { default as UnifiedDataEntryForm } from './unified/UnifiedDataEntryForm';
export { default as UnifiedFieldRenderer } from './fields/UnifiedFieldRenderer';

// Enhanced components
export { default as EnhancedDataEntryForm } from './enhanced/EnhancedDataEntryForm';

// Status components  
export { default as StatusBadge } from './status/StatusBadge';

// Shared components
export { default as DataEntryFormLoading } from './shared/DataEntryFormLoading';
export { default as DataEntryFormError } from './shared/DataEntryFormError';

// Main exports
export { DataEntryTable };
export { default as SchoolManagement } from './SchoolManagement';

// Field components (active)
export { default as Field } from './fields/Field';

// Utils
export { default as formUtils } from './utils/formUtils';

// Container
export { DataEntryContainer } from './DataEntryContainer';
