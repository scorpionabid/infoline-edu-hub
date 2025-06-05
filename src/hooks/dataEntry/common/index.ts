
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

// Export types as well
export type { ValidationError, UseValidationResult } from './useValidation';
export type { UseFormStateResult } from './useFormState';
export type { SyncStatus, UseDataSyncResult } from './useDataSync';
export type { ErrorRecoveryState, UseErrorRecoveryResult } from './useErrorRecovery';
export type { RealTimeSyncState, UseRealTimeSyncResult } from './useRealTimeSync';
export type { ConflictData, UseConflictResolutionResult } from './useConflictResolution';
export type { OfflineState, UseOfflineSupportResult } from './useOfflineSupport';
export type { CacheEntry, UseDataCacheResult } from './useDataCache';
export type { BatchUpdate, UseBatchUpdatesResult } from './useBatchUpdates';
