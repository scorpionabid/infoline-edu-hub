
import { useMemo } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';

export interface UseSectorPermissionsResult {
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canView: boolean;
  readOnly: boolean;
}

export const useSectorPermissions = (sectorId: string): UseSectorPermissionsResult => {
  const permissions = usePermissions();

  return useMemo(() => {
    if (!permissions) {
      return {
        canEdit: false,
        canSubmit: false,
        canApprove: false,
        canView: true,
        readOnly: true
      };
    }

    const { isSectorAdmin, sectorId: userSectorId, isRegionAdmin, isSuperAdmin } = permissions;
    const isOwnSector = isSectorAdmin && userSectorId === sectorId;

    return {
      canEdit: isOwnSector || isRegionAdmin || isSuperAdmin,
      canSubmit: isOwnSector || isRegionAdmin || isSuperAdmin,
      canApprove: isRegionAdmin || isSuperAdmin,
      canView: true,
      readOnly: !(isOwnSector || isRegionAdmin || isSuperAdmin)
    };
  }, [permissions, sectorId]);
};

export default useSectorPermissions;
