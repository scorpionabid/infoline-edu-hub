
// Main hooks index - barrel export for all hooks
export * from './auth';
export * from './categories';
export * from './columns';
export * from './common';
export * from './approval';
export * from './reports';
export * from './schools';
export * from './user';

// Data entry hooks (avoid duplicates)
export { useDataEntry } from './dataEntry/useDataEntry';
export { useDataEntryManager } from './dataEntry/useDataEntryManager';

// Individual hook exports - bunları müvafiq alt qovluqlardan ixrac edirik
export { useUsers } from './user/useUsers';
export { useUserList } from './user/useUserList';
export { useApprovalProcess } from './approval/useApprovalProcess';
export { useAssignExistingUserAsSchoolAdmin } from './schools/useAssignExistingUserAsSchoolAdmin';
export { useAvailableUsers } from './user/useAvailableUsers';
export { useDebounceCallback } from './common/useDebounceCallback';

// Common hooks
export { useTranslation } from './common/useTranslation';
export { useToast } from './common/useToast';
export { useRouter } from './common/useRouter';

// Legacy compatibility exports
export { useCategories } from './categories';
