
// Unified Data Entry Hook (PRIMARY)
export { useUnifiedDataEntry } from './useUnifiedDataEntry';
export type { 
  UseUnifiedDataEntryOptions, 
  UnifiedDataEntry 
} from './useUnifiedDataEntry';

// Specialized hooks that use the unified implementation
export { default as useSchoolDataEntry } from './school/useSchoolDataEntry';
export { default as useSectorDataEntryUnified } from './useSectorDataEntryUnified';

// Common hooks
export * from './common';

// Auto-save and validation hooks
export { useAutoSave } from './useAutoSave';
export { useRealTimeValidation } from './useRealTimeValidation';
