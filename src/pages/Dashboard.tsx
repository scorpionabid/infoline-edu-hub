
import React from 'react';
import { useAuth } from '@/context/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SectorAdminDashboard from '@/components/dashboard/SectorAdminDashboard';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import RegionAdminDashboard from '@/components/dashboard/RegionAdminDashboard';
import SchoolAdminDashboard from '@/components/dashboard/SchoolAdminDashboard';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useRealDashboardData } from '@/hooks/useRealDashboardData';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    userRole,
    isSchoolAdmin,
    isSectorAdmin,
    isSuperAdmin,
    isRegionAdmin,
  } = usePermissions();

  const {
    dashboardData,
    chartData,
    isLoading,
    error
  } = useRealDashboardData();

  React.useEffect(() => {
    if (error) {
      console.error('Dashboard data yüklənmə xətası:', error);
      toast.error('Məlumatları yükləyərkən xəta baş verdi');
    }
  }, [error]);

  return (
    <SidebarLayout>
      <div className="space-y-4">
        <DashboardHeader />
        {/* Məktəb admin üçün ilk setup yoxlanışı */}
        {isSchoolAdmin && <SchoolAdminSetupCheck />}
        {/* Rol əsaslı dashboard UI-ların dəqiq seçimi */}
        {isSuperAdmin && <SuperAdminDashboard data={dashboardData} />}
        {isRegionAdmin && <RegionAdminDashboard data={dashboardData} />}
        {isSectorAdmin && <SectorAdminDashboard data={dashboardData} />}
        {isSchoolAdmin && <SchoolAdminDashboard data={dashboardData} />}
        {/* Əgər heç bir xüsusi rol tapılmadısa, əsas dashboard content və ya icazə bildirimi */}
        {!isSuperAdmin && !isRegionAdmin && !isSectorAdmin && !isSchoolAdmin && (
          <DashboardContent
            data={dashboardData}
            chartData={chartData}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;

