
// Core hooks
export * from './useMediaQuery';
export * from './useDebounce';
export * from './useNotifications';

// Auth hooks
export * from './auth';

// Feature hooks
export * from './categories';
export { useCategoryStatus } from './categories'; // Explicitly re-export
export * from './columns';
export * from './dataEntry';
export * from './form';
export * from './reports';

// Dashboard hooks
export { useDashboard, useDashboardData } from './dashboard';

// Remove commented out exports to prevent errors
