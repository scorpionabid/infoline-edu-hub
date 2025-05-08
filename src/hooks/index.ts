
// Re-export hooks to avoid duplicate references
// Categories
export { useCategories } from './categories/useCategories';
export { useCategoryStatus } from './dataEntry/useCategoryStatus';
export { useCategoryFilters } from './categories/useCategoryFilters';
// Schools
// Create stubs for missing hooks
export const useSchool = () => {
  console.warn('useSchool hook is not fully implemented');
  return { school: null, loading: false, error: null };
};

export const useSchoolList = () => {
  console.warn('useSchoolList hook is not fully implemented');
  return { schools: [], loading: false, error: null };
};
// Users
// Create stubs for missing hooks
export const useUser = () => {
  console.warn('useUser hook is not fully implemented');
  return { user: null, loading: false, error: null };
};

export const useUserList = () => {
  console.warn('useUserList hook is not fully implemented');
  return { users: [], loading: false, error: null };
};
// Regions
export { useRegions } from './regions/useRegions';
// Sectors
export { useSectors } from './sectors/useSectors';

export * from './form';
export * from './dataEntry';
