
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

// Common hooks
export * from './common';

// Auto-save and validation hooks
export { useAutoSave } from './useAutoSave';
export { useRealTimeValidation } from './useRealTimeValidation';
