
import { useAuth } from '@/context/AuthContext';
import { DashboardData } from '@/types/dashboard';
import { UserRole } from '@/types/supabase';

/**
 * Base dashboard provider interface
 */
export interface DashboardProvider {
  getDashboardData: () => Promise<DashboardData | null>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Factory function to create the appropriate dashboard provider based on user role
 */
export const createDashboardProvider = (role: UserRole): DashboardProvider => {
  switch (role) {
    case 'superadmin':
      // Dynamic import the SuperAdminProvider
      const { useSuperAdminDashboard } = require('./superAdminProvider');
      return useSuperAdminDashboard();
    case 'regionadmin':
      // Dynamic import the RegionAdminProvider
      const { useRegionAdminDashboard } = require('./regionAdminProvider');
      return useRegionAdminDashboard();
    case 'sectoradmin':
      // Dynamic import the SectorAdminProvider
      const { useSectorAdminDashboard } = require('./sectorAdminProvider');
      return useSectorAdminDashboard();
    case 'schooladmin':
      // Dynamic import the SchoolAdminProvider
      const { useSchoolAdminDashboard } = require('./schoolAdminProvider');
      return useSchoolAdminDashboard();
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
};

/**
 * Hook to use the appropriate dashboard provider based on authenticated user role
 */
export const useDashboardProvider = (): DashboardProvider => {
  const { user: currentUser } = useAuth();
  
  if (!currentUser) {
    return {
      getDashboardData: async () => null,
      isLoading: false,
      error: new Error('User not authenticated')
    };
  }
  
  // Create provider based on user role
  return createDashboardProvider(currentUser.role as UserRole);
};
