import React from 'react';
import { useAuth } from '@/context/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SectorAdminDashboard from '@/components/dashboard/SectorAdminDashboard';
import { RegionAdminDashboard } from '@/components/dashboard/RegionAdminDashboard';
import { useRealDashboardData } from '@/hooks/useRealDashboardData';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isSchoolAdmin = user?.role === 'schooladmin';
  const isSectorAdmin = user?.role === 'sectoradmin';
  const isRegionAdmin = user?.role === 'regionadmin';
  
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
  
  // İstifadəçi və ya rol məlumatı yoxdursa, xəta göstər
  if (!user || !user.role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">
            <span className="icon">error</span>
          </div>
          <h1 className="text-xl font-semibold">unknownUserRole</h1>
          <p className="text-gray-500 mt-2">İstifadəçi rolu tapılmadı</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            tryAgain
          </button>
        </div>
      </div>
    );
  }
  
  console.log(`Dashboard: İstifadəçi rolu - ${user.role}`);
  
  return (
    <SidebarLayout>
      <div className="space-y-4">
        <DashboardHeader />
        
        {isSchoolAdmin && <SchoolAdminSetupCheck />}
        
        {isSectorAdmin ? (
          <SectorAdminDashboard />
        ) : isRegionAdmin ? (
          <RegionAdminDashboard />
        ) : (
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
