
// Main hooks index - barrel export for all hooks
export * from './api';
export * from './auth';
export * from './categories';
export * from './columns';
export * from './common';
export * from './dataEntry';
export * from './form';
export * from './business';
export * from './approval';
export * from './reports';
export * from './schools';
export * from './user';

// Individual hook exports
export { useUsers } from './useUsers';
export { useUserList } from './useUserList';
export { useApprovalProcess } from './useApprovalProcess';
export { useAssignExistingUserAsSchoolAdmin } from './useAssignExistingUserAsSchoolAdmin';
export { useAvailableUsers } from './useAvailableUsers';
export { useDebounceCallback } from './useDebounceCallback';

// Legacy compatibility exports
export { useCategories } from './categories';
export { useDataEntry } from './dataEntry';
export { useAuth } from './auth';
export { useValidation } from './form';
export { useTranslation } from './common/useTranslation';
