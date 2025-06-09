
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';

export const useUserPermissions = () => {
  const user = useAuthStore(selectUser);
  const permissions = usePermissions();
  
  return {
    user,
    ...permissions,
    hasPermission: (permission: string) => {
      // Basic permission check logic
      if (permissions.userRole === 'superadmin') return true;
      if (permissions.userRole === 'regionadmin' && permission.includes('region')) return true;
      if (permissions.userRole === 'sectoradmin' && permission.includes('sector')) return true;
      if (permissions.userRole === 'schooladmin' && permission.includes('school')) return true;
      return false;
    }
  };
};

export default useUserPermissions;
