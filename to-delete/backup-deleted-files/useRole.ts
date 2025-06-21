
import { useAuthStore } from '@/hooks/auth/useAuthStore';

export const useRole = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || 'user';
  
  return {
    role,
    isAdmin: role === 'superadmin' || role === 'regionadmin' || role === 'sectoradmin' || role === 'schooladmin',
    isSuperAdmin: role === 'superadmin',
    isRegionAdmin: role === 'regionadmin',
    isSectorAdmin: role === 'sectoradmin',
    isSchoolAdmin: role === 'schooladmin'
  };
};
