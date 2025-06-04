// Common/Shared Data Entry Hooks
// This module contains hooks that are shared across different roles

// Base functionality
export { default as useBaseDataEntry } from './useBaseDataEntry';
export { default as useFormManager } from './useFormManager';
export { default as useDataLoader } from './useDataLoader';
export { default as useSaveManager } from './useSaveManager';

// Utility hooks
export { default as useAutoSave } from './useAutoSave';
export { default as useRealTimeValidation } from './useRealTimeValidation';
export { default as useCategoryStatus } from './useCategoryStatus';
export { default as useErrorRecovery } from './useErrorRecovery';

// Management hooks
export { default as useCacheManager } from './useCacheManager';
export { default as useStatusManager } from './useStatusManager';

// Real-time functionality
export { default as useRealTimeDataEntry } from './useRealTimeDataEntry';

// Common hooks provide:
// - Base data entry functionality
// - Form state management with validation
// - Data loading with caching and retry logic
// - Save operations with different statuses
// - Auto-save functionality across components
// - Real-time validation for all forms
// - Category status management
// - Error recovery mechanisms
// - Cache management with TTL
// - Status transitions and permissions
// - Real-time collaboration features
// - Common data structures and utility functions
