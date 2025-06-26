
// This file is now redundant - the main regions store is in src/hooks/regions/useRegionsStore.ts
// Re-export from the main store to maintain backward compatibility

export { regionsStore as useRegionsStore } from './regions/useRegionsStore';
export type { EnhancedRegion } from '@/types/region';
