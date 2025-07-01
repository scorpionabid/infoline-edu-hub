import React, { useEffect, useState } from 'react';
import { useUser } from '@/hooks/auth/useUser';
import { useTranslation } from '@/contexts/TranslationContext';
import { Loader2 } from 'lucide-react';

// Role-specific dashboard components
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';

const DashboardContent: React.FC = () => {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  const userRole = user?.user_metadata?.role as string;

  useEffect(() => {
    // Simple ready state management
    if (!loading && user) {
      setIsReady(true);
    }
  }, [loading, user]);

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

  // Render role-specific dashboard
  switch (userRole) {
    case 'superadmin':
      return <SuperAdminDashboard />;
    case 'regionadmin':
      return <RegionAdminDashboard />;  
    case 'sectoradmin':
      return <SectorAdminDashboard />;
    case 'schooladmin':
      return <SchoolAdminDashboard />;
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            {t('dashboard.unknown_role')}: {userRole}
          </p>
        </div>
      );
  }
};

export default DashboardContent;
