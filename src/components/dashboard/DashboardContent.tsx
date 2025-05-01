import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '@/services/dashboardService';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import { DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData } from '@/types/dashboard';

const DashboardContent: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const entityId = userRole === 'regionadmin' ? regionId : userRole === 'sectoradmin' ? sectorId : userRole === 'schooladmin' ? schoolId : undefined;
        const dashboardData = await fetchDashboardData(userRole, entityId);
        setData(dashboardData);
      } catch (err: any) {
        console.error('Dashboard data loading error:', err);
        setError(err.message || 'Gösterge paneli verileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, userRole, regionId, sectorId, schoolId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert className="mb-6">
        <AlertDescription>{t('noDashboardData')}</AlertDescription>
      </Alert>
    );
  }

  switch (userRole) {
    case 'superadmin':
      return <SuperAdminDashboard data={data as SuperAdminDashboardData} />;
    case 'regionadmin':
      return <RegionAdminDashboard data={data as RegionAdminDashboardData} />;
    case 'sectoradmin':
      return <SectorAdminDashboard data={data as SectorAdminDashboardData} />;
    case 'schooladmin':
      return <SchoolAdminDashboard data={data as SchoolAdminDashboardData} />;
    default:
      return <div>{t('unknownRole')}</div>;
  }
};

export default DashboardContent;
