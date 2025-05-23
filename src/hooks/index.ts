
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
export * from './assignments';

// Legacy compatibility exports
export { useCategories } from './categories';
export { useDataEntry } from './dataEntry';
export { useAuth } from './auth';
export { useValidation } from './form';

// Common hooks direct exports
export { useUsers } from './common/useUsers';
export { useUserList } from './common/useUserList';
export { useTranslation } from './common/useTranslation';
export { useToast } from './common/useToast';
export { useNotifications } from './common/useNotifications';
export { useSuperUsers } from './common/useSuperUsers';
export { useRegionAdmins } from './common/useRegionAdmins';
export { useRegionsStore } from './common/useRegionsStore';
export { useSectorsStore } from './common/useSectorsStore';

// Assignment hooks
export { useAssignExistingUserAsSchoolAdmin } from './assignments/useAssignExistingUserAsSchoolAdmin';

// School hooks
export { useSchools } from './schools/useSchools';
