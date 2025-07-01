
// Export main hook
export { useDataManagement } from './useDataManagement';

// Export types
export type { 
  DataManagementStep, 
  SchoolDataEntry, 
  DataStats, 
  LoadingStates 
} from './types';

export type { DataManagementPermissions } from './core/useDataManagementPermissions';

// Export individual hooks for advanced usage
export { useDataManagementState } from './core/useDataManagementState';
export { useDataManagementPermissions } from './core/useDataManagementPermissions';
export { useDataManagementNavigation } from './core/useDataManagementNavigation';
export { useSchoolDataLoader } from './loaders/useSchoolDataLoader';
export { useDataTransformation } from './loaders/useDataTransformation';
export { useSchoolDataOperations } from './operations/useSchoolDataOperations';
export { useDataApproval } from './operations/useDataApproval';
export { useBulkOperations } from './operations/useBulkOperations';

// Re-export types from their proper sources for backward compatibility
export type { Category, Column } from '@/types/column';
