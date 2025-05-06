
import { useCallback, useMemo } from 'react';
import { useAuthStore } from './useAuthStore';
import { UserRole } from '@/types/supabase';

export function usePermissions() {
  const { user } = useAuthStore();
  
  // Normalize role
  const normalizeRole = (role: string | UserRole): UserRole => {
    if (!role) return 'user' as UserRole;
    const roleStr = String(role).toLowerCase();
    
    if (roleStr.includes('super') || roleStr === 'admin') return 'superadmin';
    if (roleStr.includes('region')) return 'regionadmin';
    if (roleStr.includes('sector')) return 'sectoradmin';
    if (roleStr.includes('school')) return 'schooladmin';
    
    return 'user' as UserRole;
  };
  
  // Check if the user has a specific role
  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user || !user.role) return false;
    
    const userRole = normalizeRole(user.role);
    
    if (Array.isArray(role)) {
      return role.some(r => normalizeRole(r) === userRole);
    }
    
    return userRole === normalizeRole(role);
  }, [user]);
  
  // Role-based permissions
  const isSuperAdmin = useMemo(() => hasRole('superadmin'), [hasRole]);
  const isRegionAdmin = useMemo(() => hasRole('regionadmin'), [hasRole]);
  const isSectorAdmin = useMemo(() => hasRole('sectoradmin'), [hasRole]);
  const isSchoolAdmin = useMemo(() => hasRole('schooladmin'), [hasRole]);
  
  // Get IDs for the current user
  const regionId = useMemo(() => user?.region_id || user?.regionId || null, [user]);
  const sectorId = useMemo(() => user?.sector_id || user?.sectorId || null, [user]);
  const schoolId = useMemo(() => user?.school_id || user?.schoolId || null, [user]);
  
  // Function-based permissions
  const canManageUsers = useMemo(() => 
    hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );
  
  const canManageCategories = useMemo(() => 
    hasRole(['superadmin', 'regionadmin']),
    [hasRole]
  );
  
  const canManageRegions = useMemo(() => 
    hasRole('superadmin'),
    [hasRole]
  );
  
  const canManageSectors = useMemo(() => 
    hasRole(['superadmin', 'regionadmin']),
    [hasRole]
  );
  
  const canManageSchools = useMemo(() => 
    hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );
  
  const canApproveData = useMemo(() => 
    hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );

  // Sektor kateqoriyalarını görə bilmək
  const canViewSectorCategories = useMemo(() => 
    hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );

  // Cari rolu əldə etmək
  const userRole = useMemo(() => {
    if (!user || !user.role) return null;
    return normalizeRole(user.role);
  }, [user]);
  
  return {
    hasRole,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    regionId,
    sectorId,
    schoolId,
    canManageUsers,
    canManageCategories,
    canManageRegions,
    canManageSectors,
    canManageSchools,
    canApproveData,
    canViewSectorCategories,
    currentRole: userRole,
    userRole, // İkisi də eyni dəyəri qaytarır
    currentUser: user
  };
}
