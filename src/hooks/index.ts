
// Bütün hook-ları təşkilatlandırılmış strukturdan ixrac edirik

// Regions
export { useRegions } from './regions/useRegions';
export { useRegionsStore } from './regions/useRegionsStore';
export { default as useCreateRegion } from './regions/useCreateRegion';
export { default as useCreateRegionAdmin } from './regions/useCreateRegionAdmin';
export { default as useRegionAdmins } from './regions/useRegionAdmins';

// Sectors
export { default as useSectors } from './sectors/useSectors';
export { default as useSectorsStore } from './sectors/useSectorsStore';
export { default as useCreateSector } from './sectors/useCreateSector';
export { default as useSectorAdminDashboard } from './sectors/useSectorAdminDashboard';

// Schools
export * from './schools';

// Categories
export { useCategories, useCategoryOperations, useCategoriesQuery, useCategoriesEnhanced } from './categories';

// Data Entry
export * from './dataEntry';

// Business Data Entry (Yeni optimizə edilmiş implementasiyalar)
import { useDataEntry as useDataEntryBusiness } from './business/dataEntry';
import { useDataEntryState as useDataEntryStateBusiness } from './business/dataEntry';
import { useTestDataEntry, useDataEntryExample } from './business/dataEntry';

export {
  useDataEntryBusiness,
  useDataEntryStateBusiness,
  useTestDataEntry,
  useDataEntryExample
};

// Common Utilities
export { 
  useBreakpoint,
  useDebounce,
  useDebounceCallback,
  useFiltering,
  useInterval,
  useIsCollapsed,
  useLocalStorage,
  useMediaQuery,
  useMobile,
  useRouter,
  useToast,
  useTranslation,
  useLanguage,
  useCachedQuery,
  invalidateCache,
  clearAllCaches
} from './common';

// Form Hooks
export * from './form';

// Notifications
export * from './notifications';

// Auth
export * from './auth';

// User hooks
export * from './user';

// Approval Hooks
export * from './approval';

// Columns Hooks
export * from './columns';

// Dashboard Hooks
export * from './dashboard';

// Exports Hooks
export * from './exports';

// Reports Hooks
export { 
  useReports, 
  useReportActions, 
  useMockReports, 
  useSchoolColumnReport 
} from './reports';
