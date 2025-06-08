
// Unified Data Entry Hook (PRIMARY)
export { default as useUnifiedDataEntry } from './useUnifiedDataEntry';
export type { 
  UseUnifiedDataEntryOptions, 
  UseUnifiedDataEntryReturn,
  UnifiedDataEntry 
} from './useUnifiedDataEntry';

// Specialized hooks that use the unified implementation
export { default as useSchoolDataEntry } from './useSchoolDataEntry';
export { default as useSectorDataEntryUnified } from './useSectorDataEntryUnified';

// Legacy re-exports for backward compatibility (will be deprecated)
export { default as useDataEntry } from './useDataEntry';

// Common hooks
export * from './common';

// Auto-save and validation hooks
export { useAutoSave } from './useAutoSave';
export { useRealTimeValidation } from './useRealTimeValidation';
