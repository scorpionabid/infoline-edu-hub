// Core form management components
export { default as DataEntryFormManager } from './DataEntryFormManager';
export { default as DataEntryFormContent } from './DataEntryFormContent';
export { default as FormFields } from './FormFields';
export { default as VirtualizedFormFields } from './VirtualizedFormFields';

// Unified form (consolidated from unified/)
export { default as UnifiedDataEntryForm } from './UnifiedDataEntryForm';  // Moved from unified/

// Shared components (consolidated from shared/)
export { default as DataEntryFormError } from './DataEntryFormError';    // Moved from shared/
export { default as DataEntryFormLoading } from './DataEntryFormLoading';  // Moved from shared/

// Auto-save and progress tracking
export { default as AutoSaveIndicator } from './AutoSaveIndicator';
export { default as ProgressTracker } from './ProgressTracker';
export { default as ValidationSummary } from './ValidationSummary';

// Note: shared_index.ts and unified_index.ts are backups of the old index files
