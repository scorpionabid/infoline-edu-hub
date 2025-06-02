// ============================================================================
// İnfoLine Permission System - Export Wrapper
// ============================================================================
// Bu fayl yeni permissions/usePermissions.ts faylını export edir
// Köhnə import path-ları ilə compatibility təmin edir

export {
  usePermissions,
  useDataAccessControl,
  checkRegionAccess,
  checkSectorAccess,
  checkSchoolAccess,
  checkIsSuperAdmin,
  checkIsRegionAdmin,
  checkIsSectorAdmin,
  checkUserRole,
  checkRegionAccessUtil,
  checkSectorAccessUtil,
  checkSchoolAccessUtil
} from './permissions/usePermissions';

export type { UsePermissionsResult } from '@/types/auth';

export { usePermissions as default } from './permissions/usePermissions';