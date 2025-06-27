// ============================================================================
// İnfoLine Permission System Exports
// ============================================================================
// Bu fayl bütün permission hook və utility-ləri export edir

// Main Permission Hook
export { 
  usePermissions,
  // useDataAccessControl
} from './usePermissions';

// Server-Side Permission Checkers
export {
  checkRegionAccess,
  checkSectorAccess,
  checkSchoolAccess,
  checkIsSuperAdmin,
  checkIsRegionAdmin,
  // checkIsSectorAdmin
} from './usePermissions';

// Permission Utility Functions
export {
  checkUserRole,
  checkRegionAccessUtil,
  checkSectorAccessUtil,
  // checkSchoolAccessUtil
} from './usePermissions';

// Default export
export { default } from './usePermissions';