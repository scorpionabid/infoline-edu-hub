import React, { useEffect, useState } from 'react';
import { useUser } from '@/hooks/auth/useUser';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuthStore, selectUserRole } from '@/hooks/auth/useAuthStore';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { Loader2 } from 'lucide-react';

// Role-specific dashboard components
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';

const DashboardContent: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  
  // Use the proper role selector from auth store
  const storeUserRole = useAuthStore(selectUserRole);
  const userRole = storeUserRole || user?.role;
  
  // Get dashboard data using the hook
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardData({
    enhanced: true,
    autoRefresh: false
  });
  
  const loading = userLoading || dashboardLoading;
  
  console.log('[DashboardContent] User role debug:', {
    storeUserRole,
    directRole: user?.role,
    finalUserRole: userRole,
    dashboardData,
    loading,
    dashboardError
  });

  useEffect(() => {
    // Simple ready state management
    if (!loading && user && dashboardData !== null) {
      setIsReady(true);
    }
  }, [loading, user, dashboardData]);

  if (loading || !isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('dashboard.loading')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('dashboard.user_not_found')}</p>
      </div>
    );
  }
  
  // Show error state
  if (dashboardError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">{t('dashboard.states.error')}</p>
          <p className="text-sm text-muted-foreground">{dashboardError.message}</p>
        </div>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (userRole) {
    case 'superadmin':
      return <SuperAdminDashboard dashboardData={dashboardData} />;
    case 'regionadmin':
      return <RegionAdminDashboard dashboardData={dashboardData} />;  
    case 'sectoradmin':
      return <SectorAdminDashboard dashboardData={dashboardData} />;
    case 'schooladmin':
      return <SchoolAdminDashboard dashboardData={dashboardData} />;
    default:
      console.warn('[DashboardContent] Unknown user role:', userRole);
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              {t('dashboard.unknown_role') || 'Bilinməyən rol'}: {userRole || 'Rol təyin edilməyib'}
            </p>
            <p className="text-sm text-muted-foreground">
              Sistem administrator ilə əlaqə saxlayın.
            </p>
          </div>
        </div>
      );
  }
};

export default DashboardContent;
