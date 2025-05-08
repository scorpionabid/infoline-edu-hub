
// Core hooks
export * from './useMediaQuery';
export * from './useDebounce';
export * from './useNotifications';

// Auth hooks
export * from './auth';

// Feature hooks
export * from './categories';
export { useCategoryStatus } from './categories'; 
export * from './columns';
export * from './dataEntry';
export * from './form';
export * from './reports';

// Dashboard hooks
export { useDashboard, useDashboardData } from './dashboard';

// Remove unused exports to prevent errors
// Many of these hooks don't exist in the codebase yet
/* 
export * from './useToast';
export * from './useCopyToClipboard';
export * from './useLocalStorage';
export * from './useSchools';
export * from './useSectors';
export * from './useRegions';
export * from './useUsers';
export * from './ui';
export * from './useSearch';
export * from './useSorting';
export * from './useFilters';
export * from './useApproval';
export * from './useApprovalData';
*/
