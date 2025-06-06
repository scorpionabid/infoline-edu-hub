
import { useMemo } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';

export interface UseSchoolPermissionsResult {
  canEdit: boolean;
  canSubmit: boolean;
  canView: boolean;
  readOnly: boolean;
}

export const useSchoolPermissions = (schoolId: string): UseSchoolPermissionsResult => {
  const permissions = usePermissions();

  return useMemo(() => {
    if (!permissions) {
      return {
        canEdit: false,
        canSubmit: false,
        canView: true,
        readOnly: true
      };
    }

    const { isSchoolAdmin, userSchoolId } = permissions;
    const isOwnSchool = isSchoolAdmin && userSchoolId === schoolId;

    return {
      canEdit: isOwnSchool,
      canSubmit: isOwnSchool,
      canView: true,
      readOnly: !isOwnSchool
    };
  }, [permissions, schoolId]);
};

export default useSchoolPermissions;
