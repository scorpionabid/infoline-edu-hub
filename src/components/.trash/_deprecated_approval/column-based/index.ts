// Column-Based Approval Components
export { default as ColumnBasedApprovalManager } from './ColumnBasedApprovalManager';
export { default as ColumnSelector } from './ColumnSelector';
export { default as SchoolDataTable } from './SchoolDataTable';
export { default as ApprovalActions } from './ApprovalActions';

// Re-export types for convenience
export type {
  ColumnInfo,
  SchoolDataEntry,
  ColumnBasedFilter,
  ColumnBasedStats,
  BulkApprovalResult,
  CategoryWithColumnCount
} from '@/types/columnBasedApproval';
