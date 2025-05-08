
// Core hooks
export * from './useMediaQuery';
export * from './useDebounce';
export * from './useNotifications';

// Auth hooks
export * from './auth';

// Feature hooks
export * from './categories';
export { useCategories } from './categories'; 
export { useCategoryStatus } from './categories';
export * from './columns';
export * from './dataEntry';
export * from './form';
export * from './reports';
export * from './schools';

// Necessary exports from hooks/dashboard
export { useDashboard, useDashboardData } from './dashboard';

// Remove duplicate exports and non-existent imports
// export * from './useToast';
// export * from './useMediaQuery';
// export * from './useDebounce';
// export * from './useCopyToClipboard';
// export * from './useLocalStorage';
// export * from './useNotifications';
// export * from './useCategories';
// export * from './useSchools';
// export * from './useSectors';
// export * from './useRegions';
// export * from './useUsers';
// export * from './dashboard';
// export * from './ui';
// export * from './useSearch';
// export * from './useSorting';
// export * from './useFilters';
// export * from './useApproval';
// export * from './useApprovalData';
