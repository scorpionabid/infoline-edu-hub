
import { useUser } from '@/hooks/auth/useUser';

export interface DataManagementPermissions {
  canEdit: boolean;
  canApprove: boolean;
}

export const useDataManagementPermissions = () => {
  const { user } = useUser();
  const userRole = user?.user_metadata?.role as string;

  const permissions: DataManagementPermissions = {
    canEdit: true, // All users can edit (including sectoradmin)
    canApprove: ['regionadmin', 'superadmin', 'sectoradmin'].includes(userRole),
  };

  return { permissions, userRole };
};
