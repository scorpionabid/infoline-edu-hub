
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useRealDashboardData } from '@/hooks/useRealDashboardData';

export const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const { 
    dashboardData, 
    chartData, 
    isLoading,
    error,
    refetch 
  } = useRealDashboardData();

  React.useEffect(() => {
    if (error) {
      toast.error('Məlumatları yükləyərkən xəta baş verdi');
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive mb-4">Məlumatları yükləyərkən xəta baş verdi</p>
        <Button variant="outline" onClick={refetch}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Yenilə
        </Button>
      </div>
    );
  }

  // Dashboard məzmununu rola görə render edirik
  if (!dashboardData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Məlumat tapılmadı</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dashboard məlumatları hazırda əlçatan deyil.</p>
        </CardContent>
      </Card>
    );
  }

  switch (user?.role) {
    case 'superadmin':
      return <SuperAdminDashboard data={dashboardData} onRefresh={refetch} />;
    case 'regionadmin':
      return <RegionAdminDashboard data={dashboardData} />;
    case 'sectoradmin':
      return <SectorAdminDashboard />;
    case 'schooladmin':
      return (
        <SchoolAdminDashboard 
          data={dashboardData}
          isLoading={isLoading}
          error={error}
          onRefresh={refetch}
          navigateToDataEntry={() => {}}
          handleFormClick={() => {}}
        />
      );
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>Məlumat tapılmadı</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dashboard məlumatları hazırda əlçatan deyil.</p>
          </CardContent>
        </Card>
      );
  }
};

export default DashboardContent;
