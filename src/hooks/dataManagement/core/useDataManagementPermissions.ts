
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';

export interface DataManagementPermissions {
  canEdit: boolean;
  canApprove: boolean;
  canViewAll: boolean;
  role: string;
  sectorId?: string;
  regionId?: string;
}

export const useDataManagementPermissions = () => {
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);

  const permissions: DataManagementPermissions = {
    canEdit: true, // All users can edit (including sectoradmin)
    canApprove: ['regionadmin', 'superadmin', 'sectoradmin'].includes(userRole || ''),
    canViewAll: ['superadmin', 'regionadmin'].includes(userRole || ''),
    role: userRole || 'user',
    sectorId: user?.sector_id,
    regionId: user?.region_id,
  };

  return { permissions, userRole };
};
