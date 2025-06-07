// Core components (primary interfaces)
export { default as DataEntryFormManager } from './core/DataEntryFormManager';
export { default as UnifiedDataEntryForm } from './core/UnifiedDataEntryForm'; // Moved from unified/
export { default as EnhancedDataEntryForm } from './enhanced/EnhancedDataEntryForm';

// Field components (unified)
export { default as UnifiedFieldRenderer } from './fields/UnifiedFieldRenderer';
export { default as FormField } from './fields/FormField'; // Moved from components/

// Core form utilities
export { default as FormFields } from './core/FormFields';
export { default as DataEntryFormContent } from './core/DataEntryFormContent';

// Status and loading (consolidated)
export { default as StatusBadge } from './status/StatusBadge';
export { default as DataEntryFormLoading } from './core/DataEntryFormLoading'; // Moved from shared/
export { default as DataEntryFormError } from './core/DataEntryFormError'; // Moved from shared/

// Table component (active - NOT deleted)
export { default as DataEntryTable } from './DataEntryTable';

// Page-level components
export { default as SchoolDataEntryManager } from './SchoolDataEntryManager';
export { default as SchoolManagement } from './SchoolManagement'; 
export { default as SectorDataEntry } from './SectorDataEntry';

// Container and actions
export { DataEntryContainer } from './DataEntryContainer';
export { default as ExcelActions } from './ExcelActions';

// Utils
export { default as formUtils } from './utils/formUtils';

// Note: The following have been refactored:
// - unified/ folder merged into core/
// - shared/ folder merged into core/  
// - components/ folder merged into fields/
// - inputs/ folder merged into fields/
// - Deprecated field components removed (Field.tsx, BaseField.tsx, etc.)
// - adapters/ folder removed (over-engineering)
