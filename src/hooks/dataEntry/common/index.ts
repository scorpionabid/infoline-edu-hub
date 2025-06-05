
// Common shared hooks across all data entry functionality
export { default as useAutoSave } from './useAutoSave';
export { default as useValidation } from './useValidation';
export { default as useFormState } from './useFormState';
export { default as useDataSync } from './useDataSync';
export { default as useErrorRecovery } from './useErrorRecovery';

// Real-time functionality
export { default as useRealTimeSync } from './useRealTimeSync';
export { default as useConflictResolution } from './useConflictResolution';
export { default as useOfflineSupport } from './useOfflineSupport';

// Performance optimization
export { default as useDataCache } from './useDataCache';
export { default as useBatchUpdates } from './useBatchUpdates';
export { default as useDebounce } from './useDebounce';

// All shared hooks used across School Admin and Sector Admin data entry
export * from './useAutoSave';
export * from './useValidation';
export * from './useFormState';
export * from './useDataSync';
export * from './useErrorRecovery';
export * from './useRealTimeSync';
export * from './useConflictResolution';
export * from './useOfflineSupport';
export * from './useDataCache';
export * from './useBatchUpdates';
export * from './useDebounce';
