
import { useAuth } from '@/context/auth';
import { useMemo } from 'react';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

interface UsePermissionsReturn {
  userRole: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  canRegionAdminManageCategoriesColumns: boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();
  
  return useMemo(() => {
    // Default permissions for not logged-in users
    if (!user) {
      return {
        userRole: 'user' as UserRole,
        isAdmin: false,
        isSuperAdmin: false,
        isRegionAdmin: false,
        isSectorAdmin: false,
        isSchoolAdmin: false,
        regionId: null,
        sectorId: null,
        schoolId: null,
        canRegionAdminManageCategoriesColumns: false
      };
    }
    
    // Get user role
    const userRole = user.role as UserRole;
    
    // Check if user is an admin (any kind)
    const isAdmin = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(userRole);
    
    // Specific roles
    const isSuperAdmin = userRole === 'superadmin';
    const isRegionAdmin = userRole === 'regionadmin';
    const isSectorAdmin = userRole === 'sectoradmin';
    const isSchoolAdmin = userRole === 'schooladmin';
    
    // Region adminləri kateqoriya və sütunları idarə edə bilər
    const canRegionAdminManageCategoriesColumns = isSuperAdmin || isRegionAdmin;
    
    return {
      userRole,
      isAdmin,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      regionId: user.regionId || null,
      sectorId: user.sectorId || null,
      schoolId: user.schoolId || null,
      canRegionAdminManageCategoriesColumns
    };
  }, [user]);
};
